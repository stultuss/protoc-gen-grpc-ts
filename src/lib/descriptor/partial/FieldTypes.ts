import {FieldDescriptorProto, FieldOptions} from 'google-protobuf/google/protobuf/descriptor_pb';
import {EntryMap, EnumEntry, MessageEntry} from '../../EntryMap';
import {Utility} from '../../Utility';

export const MESSAGE_TYPE = FieldDescriptorProto.Type.TYPE_MESSAGE;
export const BYTES_TYPE = FieldDescriptorProto.Type.TYPE_BYTES;
export const ENUM_TYPE = FieldDescriptorProto.Type.TYPE_ENUM;

export const JS_NORMAL = FieldOptions.JSType.JS_NORMAL;
export const JS_STRING = FieldOptions.JSType.JS_STRING;
export const JS_NUMBER = FieldOptions.JSType.JS_NUMBER;

const TypeNumToTypeString: {[key: number]: string} = {};
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_DOUBLE] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_FLOAT] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_INT64] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_UINT64] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_INT32] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_FIXED64] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_FIXED32] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_BOOL] = 'boolean';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_STRING] = 'string';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_GROUP] = 'Object';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_MESSAGE] = 'Object';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_BYTES] = 'Uint8Array';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_UINT32] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_ENUM] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_SFIXED32] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_SFIXED64] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_SINT32] = 'number';
TypeNumToTypeString[FieldDescriptorProto.Type.TYPE_SINT64] = 'number';

const JsTypeNumToTypeString: {[key: number]: string} = {};
JsTypeNumToTypeString[JS_STRING] = 'string'; // [jstype = JS_STRING]
JsTypeNumToTypeString[JS_NUMBER] = 'number'; // [jstype = JS_NUMBER]

export namespace FieldTypes {

    export function getTypeName(fieldTypeNum: number): string {
        return TypeNumToTypeString[fieldTypeNum];
    }

    export function getJsTypeName(jstype: number): string | undefined {
        return JsTypeNumToTypeString[jstype];
    }

    export function getFieldType(type: FieldDescriptorProto.Type, typeName: string, currentFileName: string, entryMap: EntryMap): string {
        let fieldType: string;
        let fromExport: MessageEntry | EnumEntry;
        let withinNamespace: string;

        switch (type) {
            case MESSAGE_TYPE:
                fromExport = entryMap.getMessageEntry(typeName);
                if (!fromExport) {
                    throw new Error('Could not getFieldType for message: ' + typeName + ' (in ' + currentFileName + ')');
                }
                withinNamespace = Utility.withinNamespaceFromExportEntry(typeName, fromExport);
                if (fromExport.fileName === currentFileName) {
                    fieldType = withinNamespace;
                } else {
                    fieldType = Utility.filePathToPseudoNamespace(fromExport.fileName) + '.' + withinNamespace;
                }
                break;

            case ENUM_TYPE:
                fromExport = entryMap.getEnumEntry(typeName);
                if (!fromExport) {
                    throw new Error('Could not getFieldType for enum: ' + typeName + ' (in ' + currentFileName + ')');
                }
                withinNamespace = Utility.withinNamespaceFromExportEntry(typeName, fromExport);
                if (fromExport.fileName === currentFileName) {
                    fieldType = withinNamespace;
                } else {
                    fieldType = Utility.filePathToPseudoNamespace(fromExport.fileName) + '.' + withinNamespace;
                }
                break;

            default:
                fieldType = TypeNumToTypeString[type];
                break;
        }

        return fieldType;
    }

}
