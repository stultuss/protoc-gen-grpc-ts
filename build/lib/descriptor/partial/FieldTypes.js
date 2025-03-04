"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTypes = exports.ENUM_TYPE = exports.BYTES_TYPE = exports.MESSAGE_TYPE = void 0;
const Utility_1 = require("../../Utility");
exports.MESSAGE_TYPE = 11;
exports.BYTES_TYPE = 12;
exports.ENUM_TYPE = 14;
const TypeNumToTypeString = {};
TypeNumToTypeString[1] = 'number'; // TYPE_DOUBLE
TypeNumToTypeString[2] = 'number'; // TYPE_FLOAT
TypeNumToTypeString[3] = 'number'; // TYPE_INT64
TypeNumToTypeString[4] = 'number'; // TYPE_UINT64
TypeNumToTypeString[5] = 'number'; // TYPE_INT32
TypeNumToTypeString[6] = 'number'; // TYPE_FIXED64
TypeNumToTypeString[7] = 'number'; // TYPE_FIXED32
TypeNumToTypeString[8] = 'boolean'; // TYPE_BOOL
TypeNumToTypeString[9] = 'string'; // TYPE_STRING
TypeNumToTypeString[10] = 'Object'; // TYPE_GROUP
TypeNumToTypeString[exports.MESSAGE_TYPE] = 'Object'; // TYPE_MESSAGE - Length-delimited aggregate.
TypeNumToTypeString[exports.BYTES_TYPE] = 'Uint8Array'; // TYPE_BYTES
TypeNumToTypeString[13] = 'number'; // TYPE_UINT32
TypeNumToTypeString[exports.ENUM_TYPE] = 'number'; // TYPE_ENUM
TypeNumToTypeString[15] = 'number'; // TYPE_SFIXED32
TypeNumToTypeString[16] = 'number'; // TYPE_SFIXED64
TypeNumToTypeString[17] = 'number'; // TYPE_SINT32 - Uses ZigZag encoding.
TypeNumToTypeString[18] = 'number'; // TYPE_SINT64 - Uses ZigZag encoding.
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
                    throw new Error('Could not getFieldType for message: ' + typeName);
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
                    throw new Error('Could not getFieldType for enum: ' + typeName);
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
