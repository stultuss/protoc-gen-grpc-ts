'use strict';

/**
 * Regenerates the golden baseline files under test/golden/ from the CURRENT
 * implementation. Run only when a generated-output change is intentional:
 *   node test/update-golden.js
 */

const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const {CodeGeneratorResponse} = require('google-protobuf/google/protobuf/compiler/plugin_pb');

const {FileDescriptorMSG} = require('../build/lib/descriptor/FileDescriptorMSG');
const {FileDescriptorGRPC} = require('../build/lib/descriptor/FileDescriptorGRPC');
const {EntryMap} = require('../build/lib/EntryMap');

const {
    kitchenSinkFile,
    serviceFile,
    externalTypesFile,
    noPackageFile,
    proto2File,
    proto3OptionalFile,
    integrationRequest,
} = require('./helpers/fixtures');

const GOLDEN_DIR = path.join(__dirname, 'golden');
const ROOT = path.join(__dirname, '..');

function entryMapFor(...files) {
    const entryMap = new EntryMap();
    files.forEach(fd => entryMap.parseFileDescriptor(fd));
    return entryMap;
}

function writeGolden(fileName, content) {
    const target = path.join(GOLDEN_DIR, fileName);
    fs.writeFileSync(target, content);
    process.stdout.write(`wrote ${path.relative(ROOT, target)} (${content.length} bytes)\n`);
}

function generateUnitBaselines() {
    const kitchen = kitchenSinkFile();
    const svc = serviceFile();
    const external = externalTypesFile();
    const noPkg = noPackageFile();
    const proto2 = proto2File();
    const optional = proto3OptionalFile();
    const all = entryMapFor(kitchen, svc, external, noPkg, proto2, optional);

    writeGolden('kitchen-product_pb.d.ts', FileDescriptorMSG.print(kitchen, all));
    writeGolden('nopkg-plain_pb.d.ts', FileDescriptorMSG.print(noPkg, all));
    writeGolden('service-product_pb.d.ts', FileDescriptorMSG.print(svc, all));
    writeGolden('service-product_grpc_pb.d.ts', FileDescriptorGRPC.print(svc, all));
    writeGolden('legacy-old_pb.d.ts', FileDescriptorMSG.print(proto2, all));
    writeGolden('modern-optional_pb.d.ts', FileDescriptorMSG.print(optional, all));
}

function generatePluginBaselines() {
    const request = integrationRequest();
    const result = spawnSync(process.execPath, [path.join(ROOT, 'build', 'index.js')], {
        input: Buffer.from(request.serializeBinary()),
        encoding: 'buffer',
    });
    if (result.status !== 0) {
        throw new Error(`plugin exited ${result.status}: ${result.stderr.toString()}`);
    }
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    response.getFileList().forEach(file => {
        const base = file.getName().replace(/\//g, '-').replace(/\.d\.ts$/, '');
        writeGolden(`plugin-${base}.d.ts`, file.getContent());
    });
}

fs.mkdirSync(GOLDEN_DIR, {recursive: true});
generateUnitBaselines();
generatePluginBaselines();
process.stdout.write('golden baselines regenerated\n');
