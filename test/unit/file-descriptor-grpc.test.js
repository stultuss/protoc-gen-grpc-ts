'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {FileDescriptorGRPC} = require('../../build/lib/descriptor/FileDescriptorGRPC');
const {EntryMap} = require('../../build/lib/EntryMap');
const {
    kitchenSinkFile,
    serviceFile,
    externalTypesFile,
    proto2File,
    proto3OptionalFile,
} = require('../helpers/fixtures');
const {fileDescriptor} = require('../helpers/proto-builders');

const GOLDEN_DIR = path.join(__dirname, '..', 'golden');

function entryMapFor(...files) {
    const entryMap = new EntryMap();
    files.forEach(fd => entryMap.parseFileDescriptor(fd));
    return entryMap;
}

function readGolden(name) {
    return fs.readFileSync(path.join(GOLDEN_DIR, name), 'utf8');
}

function allEntries() {
    return entryMapFor(kitchenSinkFile(), serviceFile(), externalTypesFile(), proto2File(), proto3OptionalFile());
}

test('FileDescriptorGRPC grpc-js output matches the golden baseline', () => {
    assert.equal(FileDescriptorGRPC.print(serviceFile(), allEntries()), readGolden('service-product_grpc_pb.d.ts'));
});

test('files without services produce no output', () => {
    const fd = fileDescriptor({name: 'nosvc.proto', pkg: 'com.n', messages: []});
    assert.equal(FileDescriptorGRPC.print(fd, new EntryMap()), '');
});

test('annotations dependency is filtered in grpc output', () => {
    const output = FileDescriptorGRPC.print(serviceFile(), allEntries());
    assert.equal(output.includes('annotations'), false);
});

test('well-known and relative dependencies are imported in grpc output', () => {
    const output = FileDescriptorGRPC.print(serviceFile(), allEntries());
    assert.match(output, /import \* as google_protobuf_empty_pb from 'google-protobuf\/google\/protobuf\/empty_pb';/);
    assert.match(output, /import \* as kitchen_product_pb from '\.\.\/kitchen\/product_pb';/);
    assert.match(output, /import \* as service_product_pb from '\.\.\/service\/product_pb';/);
});

test('service method paths use package, service and method names', () => {
    const output = FileDescriptorGRPC.print(serviceFile(), allEntries());
    assert.match(output, /path: '\/com\.svc\.ProductService\/Get'/);
    assert.match(output, /path: '\/com\.svc\.ProductService\/Chat'/);
});

test('all four RPC shapes produce the correct handler types', () => {
    const output = FileDescriptorGRPC.print(serviceFile(), allEntries());
    assert.match(output, /get: grpc\.handleUnaryCall<service_product_pb\.GetReq, service_product_pb\.Item>;/);
    assert.match(output, /watch: grpc\.handleServerStreamingCall<service_product_pb\.GetReq, service_product_pb\.Item>;/);
    assert.match(output, /upload: grpc\.handleClientStreamingCall<service_product_pb\.GetReq, service_product_pb\.Item>;/);
    assert.match(output, /chat: grpc\.handleBidiStreamingCall<service_product_pb\.GetReq, service_product_pb\.Item>;/);
});

test('cross-file method types resolve through the pseudo namespace', () => {
    const output = FileDescriptorGRPC.print(serviceFile(), allEntries());
    assert.match(output, /getKitchen: grpc\.handleUnaryCall<service_product_pb\.GetReq, kitchen_product_pb\.Product>;/);
});

test('service data factories return fresh default objects', () => {
    assert.deepEqual(FileDescriptorGRPC.newServiceType(), {serviceName: '', methods: []});
    assert.deepEqual(FileDescriptorGRPC.newServiceMethodType(), {
        packageName: '',
        serviceName: '',
        methodName: '',
        requestStream: false,
        responseStream: false,
        requestTypeName: '',
        responseTypeName: '',
        type: 'ClientUnaryCall',
    });
    const first = FileDescriptorGRPC.newServiceType();
    first.serviceName = 'mutated';
    assert.deepEqual(FileDescriptorGRPC.newServiceType(), {serviceName: '', methods: []});
});
