'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {FileDescriptorMSG} = require('../../build/lib/descriptor/FileDescriptorMSG');
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

test('FileDescriptorMSG kitchen-sink output matches the golden baseline', () => {
    const kitchen = kitchenSinkFile();
    const all = entryMapFor(kitchen, serviceFile(), externalTypesFile(), proto2File(), proto3OptionalFile());
    assert.equal(FileDescriptorMSG.print(kitchen, all), readGolden('kitchen-product_pb.d.ts'));
});

test('FileDescriptorMSG service output matches the golden baseline', () => {
    const svc = serviceFile();
    const all = entryMapFor(kitchenSinkFile(), svc, externalTypesFile(), proto2File(), proto3OptionalFile());
    assert.equal(FileDescriptorMSG.print(svc, all), readGolden('service-product_pb.d.ts'));
});

test('FileDescriptorMSG proto2 output matches the golden baseline', () => {
    const proto2 = proto2File();
    const all = entryMapFor(kitchenSinkFile(), serviceFile(), externalTypesFile(), proto2, proto3OptionalFile());
    assert.equal(FileDescriptorMSG.print(proto2, all), readGolden('legacy-old_pb.d.ts'));
});

test('FileDescriptorMSG proto3-optional output matches the golden baseline', () => {
    const optional = proto3OptionalFile();
    const all = entryMapFor(kitchenSinkFile(), serviceFile(), externalTypesFile(), proto2File(), optional);
    assert.equal(FileDescriptorMSG.print(optional, all), readGolden('modern-optional_pb.d.ts'));
});

test('well-known dependencies import from google-protobuf module', () => {
    const kitchen = kitchenSinkFile();
    const all = entryMapFor(kitchen, externalTypesFile());
    const output = FileDescriptorMSG.print(kitchen, all);
    assert.match(output, /import \* as google_protobuf_timestamp_pb from 'google-protobuf\/google\/protobuf\/timestamp_pb';/);
});

test('relative dependencies import with path to root', () => {
    const kitchen = kitchenSinkFile();
    const all = entryMapFor(kitchen, externalTypesFile());
    const output = FileDescriptorMSG.print(kitchen, all);
    assert.match(output, /import \* as other_types_pb from '\.\.\/other\/types_pb';/);
});

test('annotations dependency is NOT filtered in message files (current behaviour)', () => {
    const svc = serviceFile();
    const all = entryMapFor(svc);
    const output = FileDescriptorMSG.print(svc, all);
    assert.match(output, /import \* as google_api_annotations_pb from '\.\.\/google\/api\/annotations_pb';/);
});

test('empty file renders only header and jspb import', () => {
    const fd = fileDescriptor({name: 'empty.proto', pkg: 'com.e', syntax: 'proto3'});
    const output = FileDescriptorMSG.print(fd, new EntryMap());
    assert.equal(output, '// package: com.e\n// file: empty.proto\n\nimport * as jspb from \'google-protobuf\';\n\n');
});
