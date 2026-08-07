'use strict';

const {
    FileDescriptorProto,
    DescriptorProto,
    FieldDescriptorProto,
    EnumDescriptorProto,
    EnumValueDescriptorProto,
    OneofDescriptorProto,
    ServiceDescriptorProto,
    MethodDescriptorProto,
    MessageOptions,
    FieldOptions,
} = require('google-protobuf/google/protobuf/descriptor_pb');

const T = FieldDescriptorProto.Type;
const L = FieldDescriptorProto.Label;

/**
 * Build a FieldDescriptorProto.
 * @param {string} name
 * @param {number} number
 * @param {number} type one of FieldDescriptorProto.Type.*
 * @param {{label?: number, typeName?: string, oneofIndex?: number, proto3Optional?: boolean, options?: any}} [opts]
 */
function field(name, number, type, opts = {}) {
    const f = new FieldDescriptorProto();
    f.setName(name);
    f.setNumber(number);
    f.setType(type);
    if (opts.label !== undefined) f.setLabel(opts.label);
    if (opts.typeName !== undefined) f.setTypeName(opts.typeName);
    if (opts.oneofIndex !== undefined) f.setOneofIndex(opts.oneofIndex);
    if (opts.proto3Optional !== undefined) f.setProto3Optional(opts.proto3Optional);
    if (opts.options !== undefined) f.setOptions(opts.options);
    return f;
}

/** @param {string} name */
function oneof(name) {
    const o = new OneofDescriptorProto();
    o.setName(name);
    return o;
}

/** @param {string} name */
function enumType(name, values) {
    const e = new EnumDescriptorProto();
    e.setName(name);
    e.setValueList(values.map(([vName, vNumber]) => {
        const v = new EnumValueDescriptorProto();
        v.setName(vName);
        v.setNumber(vNumber);
        return v;
    }));
    return e;
}

/**
 * Build a DescriptorProto.
 * @param {string} name
 * @param {{fields?: any[], nestedMessages?: any[], enums?: any[], oneofs?: any[], options?: any, extensions?: any[]}} [opts]
 */
function message(name, opts = {}) {
    const m = new DescriptorProto();
    m.setName(name);
    if (opts.fields) m.setFieldList(opts.fields);
    if (opts.nestedMessages) m.setNestedTypeList(opts.nestedMessages);
    if (opts.enums) m.setEnumTypeList(opts.enums);
    if (opts.oneofs) m.setOneofDeclList(opts.oneofs);
    if (opts.extensions) m.setExtensionList(opts.extensions);
    if (opts.options) m.setOptions(opts.options);
    return m;
}

/** Map-entry nested message used by protoc for `map<K, V>`. */
function mapEntry(entryName, keyType, keyTypeName, valueType, valueTypeName) {
    const options = new MessageOptions();
    options.setMapEntry(true);
    return message(entryName, {
        options,
        fields: [
            field('key', 1, keyType, keyTypeName ? { typeName: keyTypeName } : {}),
            field('value', 2, valueType, valueTypeName ? { typeName: valueTypeName } : {}),
        ],
    });
}

/** @param {string} name */
function service(name, methods) {
    const s = new ServiceDescriptorProto();
    s.setName(name);
    s.setMethodList(methods);
    return s;
}

/**
 * @param {string} name
 * @param {string} inputType full name with leading dot
 * @param {string} outputType full name with leading dot
 * @param {{clientStreaming?: boolean, serverStreaming?: boolean}} [opts]
 */
function method(name, inputType, outputType, opts = {}) {
    const m = new MethodDescriptorProto();
    m.setName(name);
    m.setInputType(inputType);
    m.setOutputType(outputType);
    if (opts.clientStreaming) m.setClientStreaming(true);
    if (opts.serverStreaming) m.setServerStreaming(true);
    return m;
}

/**
 * Build a FileDescriptorProto.
 * @param {{name?: string, pkg?: string, syntax?: string, messages?: any[], enums?: any[],
 *          services?: any[], deps?: string[], extensions?: any[]}} [opts]
 */
function fileDescriptor(opts = {}) {
    const fd = new FileDescriptorProto();
    if (opts.name !== undefined) fd.setName(opts.name);
    if (opts.pkg !== undefined) fd.setPackage(opts.pkg);
    if (opts.syntax !== undefined) fd.setSyntax(opts.syntax);
    if (opts.messages) fd.setMessageTypeList(opts.messages);
    if (opts.enums) fd.setEnumTypeList(opts.enums);
    if (opts.services) fd.setServiceList(opts.services);
    if (opts.deps) fd.setDependencyList(opts.deps);
    if (opts.extensions) fd.setExtensionList(opts.extensions);
    return fd;
}

module.exports = {
    T,
    L,
    FieldOptions,
    field,
    oneof,
    enumType,
    message,
    mapEntry,
    service,
    method,
    fileDescriptor,
};
