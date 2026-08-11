'use strict';

/**
 * Differential test: regenerates JavaScript with the real protoc toolchain
 * (bundled protoc + grpc_node_plugin) and TypeScript declarations with this
 * project's plugin, then verifies the .d.ts mirrors the actual runtime JS:
 *
 *  - instance methods (JS prototype methods vs class declarations)
 *  - static serialization methods
 *  - enum members (names and numeric values)
 *  - extension names
 *  - gRPC service methods (paths and method keys)
 *
 * This guards the hand-maintained mirror of js_generator.cc behaviour. It
 * requires the bundled binaries, so it is not part of CI (which installs with
 * --ignore-scripts); run it locally after generator changes:
 *
 *   npm run test:differential
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin');
const CORPUS = path.join(__dirname, 'differential', 'proto');
const MAIN_FILES = ['product.proto', 'proto2.proto', 'kitchen.proto', 'nopkg.proto'];

const exeExt = process.platform === 'win32' ? '.exe' : '';
const protoc = path.join(BIN, 'protoc' + exeExt);
const grpcPlugin = path.join(BIN, 'grpc_node_plugin' + exeExt);
const tsPlugin = path.join(BIN, 'protoc-gen-ts-plugin' + (process.platform === 'win32' ? '.cmd' : ''));

function run(cmd, args) {
    const result = spawnSync(cmd, args, {encoding: 'utf8'});
    if (result.error) {
        throw new Error(`failed to run ${cmd}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        throw new Error(`${cmd} exited ${result.status}: ${result.stderr || result.stdout}`);
    }
}

function requireBinaries() {
    for (const file of [protoc, grpcPlugin, tsPlugin]) {
        if (!fs.existsSync(file)) {
            throw new Error(
                `missing ${path.relative(ROOT, file)}.\n` +
                `The differential test needs the bundled binaries; run ` +
                `"npm install" without --ignore-scripts first.`
            );
        }
    }
}

function extract(text, regex, index) {
    return new Set([...text.matchAll(regex)].map(m => m[index]));
}

function sorted(values) {
    return [...values].sort();
}

function expectEqual(what, jsValues, dtsValues) {
    const js = jsValues instanceof Set ? jsValues : new Set(jsValues);
    const dts = dtsValues instanceof Set ? dtsValues : new Set(dtsValues);
    const lines = [];
    const missingInDts = sorted(js).filter(x => !dts.has(x));
    const missingInJs = sorted(dts).filter(x => !js.has(x));
    if (missingInDts.length) lines.push(`  missing in .d.ts: ${missingInDts.join(', ')}`);
    if (missingInJs.length) lines.push(`  missing in JS:   ${missingInJs.join(', ')}`);
    return lines.length ? `${what}:\n${lines.join('\n')}` : null;
}

// --- extraction helpers -------------------------------------------------

function jsInstanceMethods(js) {
    return extract(js, /proto\.[\w.]+\.prototype\.(\w+)\s*=\s*function/g, 1);
}

function dtsInstanceMethods(dts) {
    return extract(dts, /^(\s*)(?!static\s)(?:public\s+)?(\w+)\s*\(/gm, 2);
}

function jsStaticMethods(js) {
    return extract(js, /proto\.[\w.]+\.(toObject|deserializeBinary|deserializeBinaryFromReader|serializeBinaryToWriter)\s*=\s*function/g, 1);
}

function dtsStaticMethods(dts) {
    return extract(dts, /^(\s*)static\s+(toObject|deserializeBinary|deserializeBinaryFromReader|serializeBinaryToWriter)\s*\(/gm, 2);
}

function jsEnums(js) {
    const names = new Set();
    const entries = [];
    // jspb enum objects are `proto.<path>.<Name> = { KEY: n, ... };`. The
    // extension registries (`extensions = {}` / `extensionsBinary = {}`) also
    // look like object literals, so only accept bodies whose lines are all
    // simple `KEY: number` entries.
    for (const m of js.matchAll(/proto\.[\w.]+\.(\w+)\s*=\s*\{([^}]*)\};/g)) {
        const bodyLines = m[2].split('\n').map(s => s.trim()).filter(Boolean);
        if (!bodyLines.length || !bodyLines.every(line => /^\w+:\s*-?\d+,?$/.test(line))) {
            continue;
        }
        names.add(m[1]);
        for (const entry of m[2].matchAll(/(\w+):\s*(-?\d+)/g)) {
            entries.push(`${entry[1]}=${entry[2]}`);
        }
    }
    return {names, entries: sorted(entries)};
}

function dtsEnums(dts) {
    const names = new Set();
    const entries = [];
    for (const m of dts.matchAll(/export enum (\w+) \{([\s\S]*?)\n\s*\}/g)) {
        names.add(m[1]);
        for (const entry of m[2].matchAll(/(\w+)\s*=\s*(-?\d+)/g)) {
            entries.push(`${entry[1]}=${entry[2]}`);
        }
    }
    return {names, entries: sorted(entries)};
}

function jsExtensions(js) {
    return extract(js, /proto\.[\w.]+\.(\w+)\s*=\s*new\s+jspb\.ExtensionFieldInfo/g, 1);
}

function dtsExtensions(dts) {
    return extract(dts, /export const (\w+):\s*jspb\.ExtensionFieldInfo/g, 1);
}

function servicePaths(file) {
    return extract(file, /path:\s*'([^']+)'/g, 1);
}

function jsServiceKeys(js) {
    const keys = new Set();
    for (const m of js.matchAll(/var (\w+)Service = exports\.\1Service = \{([\s\S]*?)\n\};/g)) {
        for (const key of m[2].matchAll(/^  (\w+): \{$/gm)) {
            keys.add(key[1]);
        }
    }
    return keys;
}

function dtsServiceKeys(dts) {
    const keys = new Set();
    for (const m of dts.matchAll(/export interface I(\w+)Server extends grpc\.UntypedServiceImplementation \{([\s\S]*?)\n\}/g)) {
        for (const key of m[2].matchAll(/^  (\w+):/gm)) {
            keys.add(key[1]);
        }
    }
    return keys;
}

// --- per-file checks ----------------------------------------------------

function checkFile(outDir, fileBase) {
    const failures = [];
    const jsPath = path.join(outDir, `${fileBase}_pb.js`);
    const dtsPath = path.join(outDir, `${fileBase}_pb.d.ts`);
    if (!fs.existsSync(jsPath) || !fs.existsSync(dtsPath)) {
        return [`missing generated pair: ${fileBase}_pb.{js,d.ts}`];
    }

    const js = fs.readFileSync(jsPath, 'utf8');
    const dts = fs.readFileSync(dtsPath, 'utf8');

    failures.push(expectEqual('instance methods', jsInstanceMethods(js), dtsInstanceMethods(dts)));
    failures.push(expectEqual('static methods', jsStaticMethods(js), dtsStaticMethods(dts)));

    const jsEnumData = jsEnums(js);
    const dtsEnumData = dtsEnums(dts);
    failures.push(expectEqual('enum names', jsEnumData.names, dtsEnumData.names));
    failures.push(expectEqual('enum members', new Set(jsEnumData.entries), new Set(dtsEnumData.entries)));
    failures.push(expectEqual('extensions', jsExtensions(js), dtsExtensions(dts)));

    const grpcJsPath = path.join(outDir, `${fileBase}_grpc_pb.js`);
    const grpcDtsPath = path.join(outDir, `${fileBase}_grpc_pb.d.ts`);
    const grpcJsExists = fs.existsSync(grpcJsPath);
    const grpcDtsExists = fs.existsSync(grpcDtsPath);
    if (grpcJsExists && !grpcDtsExists) {
        // grpc_node_plugin emits a "NO SERVICES" stub for service-less files;
        // our plugin (correctly) emits no declaration file for those.
        const grpcJs = fs.readFileSync(grpcJsPath, 'utf8');
        if (!grpcJs.includes('NO SERVICES')) {
            failures.push('grpc JS exists without a matching .d.ts');
        }
    } else if (!grpcJsExists && grpcDtsExists) {
        failures.push('grpc .d.ts exists without a matching JS file');
    } else if (grpcJsExists) {
        const grpcJs = fs.readFileSync(grpcJsPath, 'utf8');
        const grpcDts = fs.readFileSync(grpcDtsPath, 'utf8');
        failures.push(expectEqual('service paths', servicePaths(grpcJs), servicePaths(grpcDts)));
        failures.push(expectEqual('service method keys', jsServiceKeys(grpcJs), dtsServiceKeys(grpcDts)));
    }

    return failures.filter(Boolean);
}

// --- main ---------------------------------------------------------------

requireBinaries();

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'protoc-diff-'));
const outDir = path.join(tmpRoot, 'out');
fs.mkdirSync(outDir);

const allFailures = [];

try {
    for (const file of MAIN_FILES) {
        const filePath = path.join(CORPUS, file);
        run(protoc, [
            `--plugin=protoc-gen-grpc=${grpcPlugin}`,
            `--js_out=import_style=commonjs,binary:${outDir}`,
            `--grpc_out=grpc_js:${outDir}`,
            `--proto_path=${CORPUS}`,
            filePath,
        ]);
        run(protoc, [
            `--plugin=protoc-gen-ts=${tsPlugin}`,
            `--ts_out=${outDir}`,
            `--proto_path=${CORPUS}`,
            filePath,
        ]);

        const failures = checkFile(outDir, path.basename(file, '.proto'));
        if (failures.length) {
            allFailures.push(`${file}:`, ...failures);
        } else {
            process.stdout.write(`PASS ${file}\n`);
        }
    }
} finally {
    fs.rmSync(tmpRoot, {recursive: true, force: true});
}

if (allFailures.length) {
    process.stderr.write(`\nFAIL:\n${allFailures.join('\n')}\n`);
    process.exit(1);
}

process.stdout.write(`\ndifferential check passed for ${MAIN_FILES.length} corpus files\n`);
