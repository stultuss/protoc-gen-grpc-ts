"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTypes = exports.ENUM_TYPE = exports.BYTES_TYPE = exports.MESSAGE_TYPE = void 0;
const descriptor_pb_1 = require("google-protobuf/google/protobuf/descriptor_pb");
const Utility_1 = require("../../Utility");
exports.MESSAGE_TYPE = descriptor_pb_1.FieldDescriptorProto.Type.TYPE_MESSAGE;
exports.BYTES_TYPE = descriptor_pb_1.FieldDescriptorProto.Type.TYPE_BYTES;
exports.ENUM_TYPE = descriptor_pb_1.FieldDescriptorProto.Type.TYPE_ENUM;
const TypeNumToTypeString = {};
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_DOUBLE] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FLOAT] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_INT64] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_UINT64] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_INT32] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FIXED64] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_FIXED32] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_BOOL] = 'boolean';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_STRING] = 'string';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_GROUP] = 'Object';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_MESSAGE] = 'Object';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_BYTES] = 'Uint8Array';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_UINT32] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_ENUM] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SFIXED32] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SFIXED64] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SINT32] = 'number';
TypeNumToTypeString[descriptor_pb_1.FieldDescriptorProto.Type.TYPE_SINT64] = 'number';
var FieldTypes;
(function (FieldTypes) {
    function getTypeName(fieldTypeNum) {
        return TypeNumToTypeString[fieldTypeNum];
    }
    FieldTypes.getTypeName = getTypeName;
    function getFieldType(type, typeName, currentFileName, entryMap) {
        let fieldType;
        let fromExport;
        let withinNamespace;
        switch (type) {
            case exports.MESSAGE_TYPE:
                fromExport = entryMap.getMessageEntry(typeName);
                if (!fromExport) {
                    throw new Error('Could not getFieldType for message: ' + typeName + ' (in ' + currentFileName + ')');
                }
                withinNamespace = Utility_1.Utility.withinNamespaceFromExportEntry(typeName, fromExport);
                if (fromExport.fileName === currentFileName) {
                    fieldType = withinNamespace;
                }
                else {
                    fieldType = Utility_1.Utility.filePathToPseudoNamespace(fromExport.fileName) + '.' + withinNamespace;
                }
                break;
            case exports.ENUM_TYPE:
                fromExport = entryMap.getEnumEntry(typeName);
                if (!fromExport) {
                    throw new Error('Could not getFieldType for enum: ' + typeName + ' (in ' + currentFileName + ')');
                }
                withinNamespace = Utility_1.Utility.withinNamespaceFromExportEntry(typeName, fromExport);
                if (fromExport.fileName === currentFileName) {
                    fieldType = withinNamespace;
                }
                else {
                    fieldType = Utility_1.Utility.filePathToPseudoNamespace(fromExport.fileName) + '.' + withinNamespace;
                }
                break;
            default:
                fieldType = TypeNumToTypeString[type];
                break;
        }
        return fieldType;
    }
    FieldTypes.getFieldType = getFieldType;
})(FieldTypes || (exports.FieldTypes = FieldTypes = {}));
