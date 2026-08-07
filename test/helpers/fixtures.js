'use strict';

const {CodeGeneratorRequest} = require('google-protobuf/google/protobuf/compiler/plugin_pb');
const {
    T,
    L,
    field,
    oneof,
    enumType,
    message,
    mapEntry,
    service,
    method,
    fileDescriptor,
} = require('./proto-builders');

/**
 * Kitchen-sink proto3 file: scalars, repeated, bytes, reserved words, nested
 * message/enum, oneof, map, cross-file message reference, top-level enum and
 * extension, plus well-known and external dependencies.
 */
function kitchenSinkFile() {
    return fileDescriptor({
        name: 'kitchen/product.proto',
        pkg: 'com.kitchen',
        syntax: 'proto3',
        deps: ['google/protobuf/timestamp.proto', 'other/types.proto'],
        messages: [
            message('Product', {
                fields: [
                    field('id', 1, T.TYPE_INT64),
                    field('name', 2, T.TYPE_STRING),
                    field('tags', 3, T.TYPE_STRING, { label: L.LABEL_REPEATED }),
                    field('data', 4, T.TYPE_BYTES),
                    field('history', 5, T.TYPE_BYTES, { label: L.LABEL_REPEATED }),
                    field('default', 6, T.TYPE_BOOL),
                    field('meta', 7, T.TYPE_MESSAGE, { typeName: '.com.kitchen.Meta' }),
                    field('kind', 8, T.TYPE_MESSAGE, { typeName: '.com.kitchen.Product.Kind' }),
                    field('status', 9, T.TYPE_ENUM, { typeName: '.com.kitchen.Product.Status' }),
                    field('ext', 10, T.TYPE_MESSAGE, { typeName: '.other.types.External' }),
                ],
                nestedMessages: [
                    message('Kind', {
                        fields: [field('label', 1, T.TYPE_STRING)],
                    }),
                ],
                enums: [
                    enumType('Status', [['UNKNOWN', 0], ['ACTIVE', 1]]),
                ],
            }),
            message('Meta', {
                fields: [field('value', 1, T.TYPE_STRING)],
            }),
            message('Order', {
                oneofs: [oneof('payment')],
                fields: [
                    field('cash', 1, T.TYPE_INT64, { oneofIndex: 0 }),
                    field('card', 2, T.TYPE_STRING, { oneofIndex: 0 }),
                    field('note', 3, T.TYPE_STRING),
                ],
            }),
            message('Shop', {
                fields: [
                    field('name', 1, T.TYPE_STRING),
                    field('list', 2, T.TYPE_MESSAGE, {
                        label: L.LABEL_REPEATED,
                        typeName: '.com.kitchen.Shop.ListEntry',
                    }),
                ],
                nestedMessages: [
                    mapEntry('ListEntry', T.TYPE_INT64, undefined, T.TYPE_MESSAGE, '.com.kitchen.Product'),
                ],
            }),
        ],
        enums: [
            enumType('Color', [['RED', 0], ['GREEN', 1], ['BLUE', 2]]),
        ],
        extensions: [
            field('kitchen_tag', 100, T.TYPE_INT32),
        ],
    });
}

/**
 * Service file exercising all four RPC shapes plus cross-file types and the
 * annotations dependency that FileDescriptorGRPC filters out.
 */
function serviceFile() {
    return fileDescriptor({
        name: 'service/product.proto',
        pkg: 'com.svc',
        syntax: 'proto3',
        deps: ['google/protobuf/empty.proto', 'google/api/annotations.proto', 'kitchen/product.proto'],
        messages: [
            message('GetReq', {
                fields: [field('id', 1, T.TYPE_STRING)],
            }),
            message('Item', {
                fields: [field('name', 1, T.TYPE_STRING)],
            }),
        ],
        services: [
            service('ProductService', [
                method('Get', '.com.svc.GetReq', '.com.svc.Item'),
                method('Watch', '.com.svc.GetReq', '.com.svc.Item', { serverStreaming: true }),
                method('Upload', '.com.svc.GetReq', '.com.svc.Item', { clientStreaming: true }),
                method('Chat', '.com.svc.GetReq', '.com.svc.Item', { clientStreaming: true, serverStreaming: true }),
                method('GetKitchen', '.com.svc.GetReq', '.com.kitchen.Product'),
            ]),
        ],
    });
}

/** External file referenced by the kitchen fixture (cross-file message type). */
function externalTypesFile() {
    return fileDescriptor({
        name: 'other/types.proto',
        pkg: 'other.types',
        syntax: 'proto3',
        messages: [
            message('External', {
                fields: [field('value', 1, T.TYPE_STRING)],
            }),
        ],
    });
}

/** File without a package exercising top-level and nested type resolution. */
function noPackageFile() {
    return fileDescriptor({
        name: 'nopkg/plain.proto',
        syntax: 'proto3',
        messages: [
            message('Outer', {
                fields: [
                    field('status', 1, T.TYPE_ENUM, {typeName: '.Outer.Status'}),
                    field('inner', 2, T.TYPE_MESSAGE, {typeName: '.Outer.Inner'}),
                ],
                nestedMessages: [message('Inner', {fields: [field('v', 1, T.TYPE_STRING)]})],
                enums: [enumType('Status', [['OK', 0]])],
            }),
            message('Top', {
                fields: [field('kind', 1, T.TYPE_ENUM, {typeName: '.Color'})],
            }),
        ],
        enums: [enumType('Color', [['RED', 0]])],
    });
}

/** Minimal proto2 file to exercise presence semantics. */
function proto2File() {
    return fileDescriptor({
        name: 'legacy/old.proto',
        pkg: 'com.legacy',
        syntax: 'proto2',
        messages: [
            message('OldMsg', {
                fields: [
                    field('req', 1, T.TYPE_STRING, { label: L.LABEL_REQUIRED }),
                    field('opt', 2, T.TYPE_INT32, { label: L.LABEL_OPTIONAL }),
                    field('rep', 3, T.TYPE_STRING, { label: L.LABEL_REPEATED }),
                    field('child', 4, T.TYPE_MESSAGE, { label: L.LABEL_OPTIONAL, typeName: '.com.legacy.OldMsg.Child' }),
                ],
                nestedMessages: [
                    message('Child', {
                        fields: [field('name', 1, T.TYPE_STRING)],
                    }),
                ],
            }),
        ],
    });
}

/** proto3 file with an optional field (synthetic oneof produced by protoc). */
function proto3OptionalFile() {
    return fileDescriptor({
        name: 'modern/optional.proto',
        pkg: 'com.modern',
        syntax: 'proto3',
        messages: [
            message('OptMsg', {
                oneofs: [oneof('_name')],
                fields: [
                    field('name', 1, T.TYPE_STRING, { oneofIndex: 0, proto3Optional: true }),
                ],
            }),
        ],
    });
}

/**
 * Build a CodeGeneratorRequest for the kitchen + service fixtures.
 * @param {string} [parameter]
 * @param {string[]} [fileToGenerate]
 */
function integrationRequest(parameter = 'grpc_js', fileToGenerate = ['kitchen/product.proto', 'service/product.proto']) {
    const req = new CodeGeneratorRequest();
    req.setFileToGenerateList(fileToGenerate);
    req.setParameter(parameter);
    req.setProtoFileList([kitchenSinkFile(), serviceFile(), externalTypesFile()]);
    return req;
}

module.exports = {
    kitchenSinkFile,
    serviceFile,
    externalTypesFile,
    noPackageFile,
    proto2File,
    proto3OptionalFile,
    integrationRequest,
};
