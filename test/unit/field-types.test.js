'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {FieldDescriptorProto} = require('google-protobuf/google/protobuf/descriptor_pb');
const {FieldTypes, MESSAGE_TYPE, BYTES_TYPE, ENUM_TYPE} = require('../../build/lib/descriptor/partial/FieldTypes');

const T = FieldDescriptorProto.Type;

function entry(pkg, fileName) {
    return {pkg, fileName};
}

test('getTypeName maps every scalar descriptor type', () => {
    const expected = {
        [T.TYPE_DOUBLE]: 'number',
        [T.TYPE_FLOAT]: 'number',
        [T.TYPE_INT64]: 'number',
        [T.TYPE_UINT64]: 'number',
        [T.TYPE_INT32]: 'number',
        [T.TYPE_FIXED64]: 'number',
        [T.TYPE_FIXED32]: 'number',
        [T.TYPE_BOOL]: 'boolean',
        [T.TYPE_STRING]: 'string',
        [T.TYPE_GROUP]: 'Object',
        [T.TYPE_MESSAGE]: 'Object',
        [T.TYPE_BYTES]: 'Uint8Array',
        [T.TYPE_UINT32]: 'number',
        [T.TYPE_ENUM]: 'number',
        [T.TYPE_SFIXED32]: 'number',
        [T.TYPE_SFIXED64]: 'number',
        [T.TYPE_SINT32]: 'number',
        [T.TYPE_SINT64]: 'number',
    };
    Object.keys(expected).forEach(typeNum => {
        assert.equal(FieldTypes.getTypeName(Number(typeNum)), expected[typeNum], `type ${typeNum}`);
    });
    assert.equal(FieldTypes.getTypeName(99), undefined);
    assert.equal(FieldTypes.getTypeName(undefined), undefined);
});

test('getFieldType resolves message types within the same file', () => {
    const entryMap = {getMessageEntry: () => entry('com.kitchen', 'kitchen/product.proto')};
    assert.equal(FieldTypes.getFieldType(MESSAGE_TYPE, 'com.kitchen.Product', 'kitchen/product.proto', entryMap), 'Product');
});

test('getFieldType resolves message types across files with the pseudo namespace', () => {
    const entryMap = {getMessageEntry: () => entry('other.types', 'other/types.proto')};
    assert.equal(FieldTypes.getFieldType(MESSAGE_TYPE, 'other.types.External', 'kitchen/product.proto', entryMap), 'other_types_pb.External');
});

test('getFieldType resolves message with empty package', () => {
    const entryMap = {getMessageEntry: () => entry('', 'plain.proto')};
    assert.equal(FieldTypes.getFieldType(MESSAGE_TYPE, 'Plain', 'kitchen/product.proto', entryMap), 'plain_pb.Plain');
});

test('getFieldType throws for missing message entry', () => {
    const entryMap = {getMessageEntry: () => undefined};
    assert.throws(
        () => FieldTypes.getFieldType(MESSAGE_TYPE, 'missing.Type', 'a.proto', entryMap),
        /Could not getFieldType for message: missing\.Type/,
    );
});

test('getFieldType resolves enum types within and across files', () => {
    const sameFile = {getEnumEntry: () => entry('com.kitchen', 'kitchen/product.proto')};
    assert.equal(FieldTypes.getFieldType(ENUM_TYPE, 'com.kitchen.Color', 'kitchen/product.proto', sameFile), 'Color');
    const otherFile = {getEnumEntry: () => entry('com.other', 'other/enum.proto')};
    assert.equal(FieldTypes.getFieldType(ENUM_TYPE, 'com.other.Color', 'kitchen/product.proto', otherFile), 'other_enum_pb.Color');
});

test('getFieldType throws for missing enum entry', () => {
    const entryMap = {getEnumEntry: () => undefined};
    assert.throws(
        () => FieldTypes.getFieldType(ENUM_TYPE, 'missing.Enum', 'a.proto', entryMap),
        /Could not getFieldType for enum: missing\.Enum/,
    );
});

test('getFieldType passes scalar types straight through', () => {
    const entryMap = {};
    assert.equal(FieldTypes.getFieldType(T.TYPE_STRING, '', 'a.proto', entryMap), 'string');
    assert.equal(FieldTypes.getFieldType(T.TYPE_BOOL, '', 'a.proto', entryMap), 'boolean');
    assert.equal(FieldTypes.getFieldType(BYTES_TYPE, '', 'a.proto', entryMap), 'Uint8Array');
});
