'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const {CodeGeneratorRequest, CodeGeneratorResponse} = require('google-protobuf/google/protobuf/compiler/plugin_pb');
const {integrationRequest, kitchenSinkFile, externalTypesFile} = require('../helpers/fixtures');

const ROOT = path.join(__dirname, '..', '..');
const PLUGIN = path.join(ROOT, 'build', 'index.js');
const GOLDEN_DIR = path.join(__dirname, '..', 'golden');

function runPlugin(request) {
    return spawnSync(process.execPath, [PLUGIN], {
        input: Buffer.from(request.serializeBinary()),
        encoding: 'buffer',
    });
}

function readGolden(name) {
    return fs.readFileSync(path.join(GOLDEN_DIR, name), 'utf8');
}

function goldenNameFor(fileName, suffix) {
    return `plugin-${fileName.replace(/\//g, '-').replace(/\.d\.ts$/, '')}${suffix}.d.ts`;
}

test('plugin generates grpc-js message and service files matching golden', () => {
    const result = runPlugin(integrationRequest('grpc_js'));
    assert.equal(result.status, 0, result.stderr.toString());
    assert.equal(result.stderr.length, 0);

    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    const files = response.getFileList();
    assert.deepEqual(files.map(f => f.getName()).sort(), [
        'kitchen/product_pb.d.ts',
        'service/product_grpc_pb.d.ts',
        'service/product_pb.d.ts',
    ]);

    files.forEach(file => {
        assert.equal(file.getContent(), readGolden(goldenNameFor(file.getName(), '')), file.getName());
    });
});

test('plugin generates legacy grpc output when the parameter is empty', () => {
    const result = runPlugin(integrationRequest(''));
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    response.getFileList().forEach(file => {
        assert.equal(file.getContent(), readGolden(goldenNameFor(file.getName(), '-legacy')), file.getName());
    });
    const grpcFile = response.getFileList().find(f => f.getName().endsWith('_grpc_pb.d.ts'));
    assert.match(grpcFile.getContent(), /import \* as grpc from 'grpc';/);
});

test('parameter must match exactly; not_grpc_js selects legacy grpc (current behaviour)', () => {
    const result = runPlugin(integrationRequest('not_grpc_js'));
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    const grpcFile = response.getFileList().find(f => f.getName().endsWith('_grpc_pb.d.ts'));
    assert.match(grpcFile.getContent(), /import \* as grpc from 'grpc';/);
});

test('comma-joined parameters are not parsed and fall back to legacy (current behaviour)', () => {
    const result = runPlugin(integrationRequest('grpc_js,keep_case'));
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    const grpcFile = response.getFileList().find(f => f.getName().endsWith('_grpc_pb.d.ts'));
    assert.match(grpcFile.getContent(), /import \* as grpc from 'grpc';/);
});

test('files without services produce only the message declaration file', () => {
    const request = integrationRequest('grpc_js', ['kitchen/product.proto']);
    const result = runPlugin(request);
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    assert.deepEqual(response.getFileList().map(f => f.getName()), ['kitchen/product_pb.d.ts']);
});

test('plugin response declares support for proto3 optional fields', () => {
    const result = runPlugin(integrationRequest('grpc_js'));
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    assert.equal(response.getSupportedFeatures(), CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL);
});

test('plugin exits non-zero with an error message when generation fails', () => {
    const request = integrationRequest('grpc_js', ['missing.proto']);
    const result = spawnSync(process.execPath, [PLUGIN], {
        input: Buffer.from(request.serializeBinary()),
        encoding: 'buffer',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr.toString(), /error:/);
    assert.equal(result.stdout.length, 0);
});

test('unparseable stdin currently yields an empty response with exit 0 (current behaviour)', () => {
    const result = spawnSync(process.execPath, [PLUGIN], {
        input: Buffer.from('this is not a CodeGeneratorRequest'),
        encoding: 'buffer',
    });
    assert.equal(result.status, 0);
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    assert.equal(response.getFileList().length, 0);
});

test('kitchen file with no services produces no grpc file through the full pipeline', () => {
    const kitchen = kitchenSinkFile();
    const external = externalTypesFile();
    const request = new CodeGeneratorRequest();
    request.setFileToGenerateList(['kitchen/product.proto']);
    request.setProtoFileList([kitchen, external]);
    const result = runPlugin(request);
    assert.equal(result.status, 0, result.stderr.toString());
    const response = CodeGeneratorResponse.deserializeBinary(result.stdout);
    assert.deepEqual(response.getFileList().map(f => f.getName()), ['kitchen/product_pb.d.ts']);
});
