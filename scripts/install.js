#!/usr/bin/env node
'use strict';

/**
 * Downloads the bundled protoc + grpc_node_plugin binaries for the current
 * platform, verifies their sha512 checksum against the values pinned in
 * package.json, and extracts them into bin/.
 *
 * This replaces @mapbox/node-pre-gyp, which streams the tarball straight into
 * extraction without any integrity check. It keeps the same mirror
 * environment variable:
 *   npm_config_grpc_tools_binary_host_mirror=https://your-mirror.example.com/
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {pipeline} = require('stream/promises');
const tar = require('tar');

const pkg = require('../package.json');
const binary = pkg.binary;

const mirrorEnv = `npm_config_${binary.module_name}_binary_host_mirror`;
const host = process.env[mirrorEnv] || binary.host;
const remotePath = binary.remote_path;
const packageName = binary.package_name
    .replace('{platform}', process.platform)
    .replace('{arch}', process.arch);

const platformKey = `${process.platform}-${process.arch}`;
const expectedSha512 = binary.sha512 && binary.sha512[platformKey];
const supported = Object.keys(binary.sha512 || {});

if (!expectedSha512) {
    console.error(
        `protoc-gen-grpc: no pinned checksum for platform "${platformKey}" ` +
        `(supported: ${supported.join(', ') || 'none'})`
    );
    process.exit(1);
}

const url = `${host.replace(/\/+$/, '')}/${remotePath.replace(/^\/+/, '')}/${packageName}`;
const targetDir = path.resolve(__dirname, '..', binary.module_path);

async function main() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'protoc-gen-grpc-'));
    const tmpFile = path.join(tmpDir, packageName);
    try {
        fs.mkdirSync(targetDir, {recursive: true});

        console.log(`protoc-gen-grpc: downloading ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`download failed: HTTP ${res.status} ${res.statusText}`);
        }
        await pipeline(res.body, fs.createWriteStream(tmpFile));

        const hash = crypto.createHash('sha512');
        for await (const chunk of fs.createReadStream(tmpFile)) {
            hash.update(chunk);
        }
        const actual = hash.digest('hex');
        if (actual !== expectedSha512) {
            throw new Error(
                `checksum mismatch for ${url}\n` +
                `  expected sha512: ${expectedSha512}\n` +
                `  actual   sha512: ${actual}`
            );
        }
        console.log(`protoc-gen-grpc: sha512 verified for ${platformKey}`);

        // Tarballs use different top-level directories (bin/ vs x64/), so
        // strip the first component to land the binaries directly in bin/.
        await tar.x({file: tmpFile, cwd: targetDir, strip: 1});

        const exeNames = ['protoc', 'grpc_node_plugin'].map(n => n + (process.platform === 'win32' ? '.exe' : ''));
        for (const name of exeNames) {
            const exePath = path.join(targetDir, name);
            if (process.platform !== 'win32' && fs.existsSync(exePath)) {
                fs.chmodSync(exePath, 0o755);
            }
        }
        console.log(`protoc-gen-grpc: installed to ${targetDir}`);
    } finally {
        fs.rmSync(tmpDir, {recursive: true, force: true});
    }
}

main().catch(err => {
    console.error(`protoc-gen-grpc: ${err.message}`);
    process.exit(1);
});
