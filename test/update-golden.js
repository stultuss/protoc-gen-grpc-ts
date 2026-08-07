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
    const proto2 = proto2File();
    const optional = proto3OptionalFile();
    const all = entryMapFor(kitchen, svc, external, proto2, optional);

    writeGolden('kitchen-product_pb.d.ts', FileDescriptorMSG.print(kitchen, all));
    writeGolden('service-product_pb.d.ts', FileDescriptorMSG.print(svc, all));
    writeGolden('service-product_grpc_pb.d.ts', FileDescriptorGRPC.print(svc, all, true));
    writeGolden('service-product_grpc_pb-legacy.d.ts', FileDescriptorGRPC.print(svc, all, false));
    writeGolden('legacy-old_pb.d.ts', FileDescriptorMSG.print(proto2, all));
    writeGolden('modern-optional_pb.d.ts', FileDescriptorMSG.print(optional, all));
}

function generatePluginBaselines() {
    for (const parameter of ['grpc_js', '']) {
        const request = integrationRequest(parameter);
        const result = spawnSync(process.execPath, [path.join(ROOT, 'build', 'index.js')], {
            input: Buffer.from(request.serializeBinary()),
            encoding: 'buffer',
        });
        if (result.status !== 0) {
            throw new Error(`plugin exited ${result.status}: ${result.stderr.toString()}`);
        }
        const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
        const suffix = parameter === '' ? '-legacy' : '';
        response.getFileList().forEach(file => {
            const base = file.getName().replace(/\//g, '-').replace(/\.d\.ts$/, '');
            writeGolden(`plugin-${base}${suffix}.d.ts`, file.getContent());
        });
    }
}

fs.mkdirSync(GOLDEN_DIR, {recursive: true});
generateUnitBaselines();
generatePluginBaselines();
process.stdout.write('golden baselines regenerated\n');
