"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.OBJECT_TYPE_NAME = void 0;
const descriptor_pb_1 = require("google-protobuf/google/protobuf/descriptor_pb");
const Printer_1 = require("../../Printer");
const Utility_1 = require("../../Utility");
const FieldTypes_1 = require("./FieldTypes");
const Enum_1 = require("./Enum");
const OneOf_1 = require("./OneOf");
const Extensions_1 = require("./Extensions");
exports.OBJECT_TYPE_NAME = 'AsObject';
var Message;
(function (Message) {
    Message.defaultMessageType = JSON.stringify({
        messageName: '',
        oneOfGroups: [],
        oneOfDeclList: [],
        fields: [],
        nestedTypes: [],
        formattedEnumListStr: [],
        formattedOneOfListStr: [],
        formattedExtListStr: [],
    });
    Message.defaultMessageFieldType = JSON.stringify({
        snakeCaseName: '',
        camelCaseName: '',
        camelUpperName: '',
        type: undefined,
        exportType: '',
    });
    function hasFieldPresence(field, fileDescriptor) {
        if (field.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_REPEATED) {
            return false;
        }
        if (field.hasOneofIndex()) {
            return true;
        }
        if (field.getType() === FieldTypes_1.MESSAGE_TYPE) {
            return true;
        }
        return (Utility_1.Utility.isProto2(fileDescriptor));
    }
    Message.hasFieldPresence = hasFieldPresence;
    function print(fileName, entryMap, descriptor, indentLevel, fileDescriptor) {
        let messageData = JSON.parse(Message.defaultMessageType);
        messageData.messageName = descriptor.getName();
        messageData.oneOfDeclList = descriptor.getOneofDeclList();
        let messageOptions = descriptor.getOptions();
        if (messageOptions !== undefined && messageOptions.getMapEntry()) {
            // this message type is the entry tuple for a map - don't output it
            return '';
        }
        const printer = new Printer_1.Printer(indentLevel);
        printer.printEmptyLn();
        printer.printLn(`export class ${messageData.messageName} extends jspb.Message {`);
        const printerToObjectType = new Printer_1.Printer(indentLevel + 1);
        printerToObjectType.printLn(`export type ${exports.OBJECT_TYPE_NAME} = {`);
        const oneOfGroups = [];
        descriptor.getFieldList().forEach(field => {
            let fieldData = JSON.parse(Message.defaultMessageFieldType);
            if (field.hasOneofIndex()) {
                let oneOfIndex = field.getOneofIndex();
                let existing = oneOfGroups[oneOfIndex];
                if (existing === undefined) {
                    existing = [];
                    oneOfGroups[oneOfIndex] = existing;
                }
                existing.push(field);
            }
            fieldData.snakeCaseName = field.getName().toLowerCase();
            fieldData.camelCaseName = Utility_1.Utility.snakeToCamel(fieldData.snakeCaseName);
            fieldData.camelUpperName = Utility_1.Utility.ucFirst(fieldData.camelCaseName);
            fieldData.type = field.getType();
            let exportType;
            let fullTypeName = field.getTypeName().slice(1);
            let withinNamespace;
            switch (fieldData.type) {
                case FieldTypes_1.MESSAGE_TYPE:
                    const fieldMessageType = entryMap.getMessageEntry(fullTypeName);
                    if (fieldMessageType === undefined) {
                        throw new Error('No message export for: ' + fullTypeName);
                    }
                    if (fieldMessageType.messageOptions !== undefined && fieldMessageType.messageOptions.getMapEntry()) {
                        let keyTuple = fieldMessageType.mapFieldOptions.key;
                        let keyType = keyTuple[0];
                        let keyTypeName = FieldTypes_1.FieldTypes.getFieldType(keyType, keyTuple[1], fileName, entryMap);
                        let valueTuple = fieldMessageType.mapFieldOptions.value;
                        let valueType = valueTuple[0];
                        let valueTypeName = FieldTypes_1.FieldTypes.getFieldType(valueType, valueTuple[1], fileName, entryMap);
                        if (valueType === FieldTypes_1.BYTES_TYPE) {
                            valueTypeName = 'Uint8Array | string';
                        }
                        printer.printIndentedLn(`get${fieldData.camelUpperName}Map(): jspb.Map<${keyTypeName}, ${valueTypeName}>;`);
                        printer.printIndentedLn(`clear${fieldData.camelUpperName}Map(): void;`);
                        printerToObjectType.printIndentedLn(`${fieldData.camelCaseName}Map: Array<[${keyTypeName}${keyType === FieldTypes_1.MESSAGE_TYPE ? '.AsObject' : ''}, ${valueTypeName}${valueType === FieldTypes_1.MESSAGE_TYPE ? '.AsObject' : ''}]>,`);
                        return;
                    }
                    withinNamespace = Utility_1.Utility.withinNamespaceFromExportEntry(fullTypeName, fieldMessageType);
                    if (fieldMessageType.fileName === fileName) {
                        exportType = withinNamespace;
                    }
                    else {
                        exportType = Utility_1.Utility.filePathToPseudoNamespace(fieldMessageType.fileName) + '.' + withinNamespace;
                    }
                    fieldData.exportType = exportType;
                    break;
                case FieldTypes_1.ENUM_TYPE:
                    let fieldEnumType = entryMap.getEnumEntry(fullTypeName);
                    if (fieldEnumType === undefined) {
                        throw new Error('No enum export for: ' + fullTypeName);
                    }
                    withinNamespace = Utility_1.Utility.withinNamespaceFromExportEntry(fullTypeName, fieldEnumType);
                    if (fieldEnumType.fileName === fileName) {
                        exportType = withinNamespace;
                    }
                    else {
                        exportType = Utility_1.Utility.filePathToPseudoNamespace(fieldEnumType.fileName) + '.' + withinNamespace;
                    }
                    fieldData.exportType = exportType;
                    break;
                default:
                    fieldData.exportType = FieldTypes_1.FieldTypes.getTypeName(fieldData.type);
                    break;
            }
            let hasClearMethod = false;
            function printClearIfNotPresent() {
                if (!hasClearMethod) {
                    hasClearMethod = true;
                    printer.printIndentedLn(`clear${fieldData.camelUpperName}${field.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_REPEATED ? 'List' : ''}(): void;`);
                }
            }
            function printRepeatedAddMethod(valueType) {
                const optionalValue = field.getType() === FieldTypes_1.MESSAGE_TYPE;
                printer.printIndentedLn(`add${fieldData.camelUpperName}(value${optionalValue ? '?' : ''}: ${valueType}, index?: number): ${valueType};`);
            }
            if (Message.hasFieldPresence(field, fileDescriptor)) {
                printer.printIndentedLn(`has${fieldData.camelUpperName}(): boolean;`);
                printClearIfNotPresent();
            }
            if (field.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_REPEATED) { // is repeated
                printClearIfNotPresent();
                if (fieldData.type === FieldTypes_1.BYTES_TYPE) {
                    printerToObjectType.printIndentedLn(`${fieldData.camelCaseName}List: Array<Uint8Array | string>,`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}List(): Array<Uint8Array | string>;`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}List_asU8(): Array<Uint8Array>;`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}List_asB64(): Array<string>;`);
                    printer.printIndentedLn(`set${fieldData.camelUpperName}List(value: Array<Uint8Array | string>): void;`);
                    printRepeatedAddMethod('Uint8Array | string');
                }
                else {
                    printerToObjectType.printIndentedLn(`${fieldData.camelCaseName}List: Array<${fieldData.exportType}${fieldData.type === FieldTypes_1.MESSAGE_TYPE ? '.AsObject' : ''}>,`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}List(): Array<${fieldData.exportType}>;`);
                    printer.printIndentedLn(`set${fieldData.camelUpperName}List(value: Array<${fieldData.exportType}>): void;`);
                    printRepeatedAddMethod(fieldData.exportType);
                }
            }
            else {
                if (fieldData.type === FieldTypes_1.BYTES_TYPE) {
                    printerToObjectType.printIndentedLn(`${fieldData.camelCaseName}: Uint8Array | string,`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}(): Uint8Array | string;`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}_asU8(): Uint8Array;`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}_asB64(): string;`);
                    printer.printIndentedLn(`set${fieldData.camelUpperName}(value: Uint8Array | string): void;`);
                }
                else {
                    let fieldObjectType = fieldData.exportType;
                    let canBeUndefined = false;
                    if (fieldData.type === FieldTypes_1.MESSAGE_TYPE) {
                        fieldObjectType += '.AsObject';
                        if (!Utility_1.Utility.isProto2(fileDescriptor) || (field.getLabel() === descriptor_pb_1.FieldDescriptorProto.Label.LABEL_OPTIONAL)) {
                            canBeUndefined = true;
                        }
                    }
                    else {
                        if (Utility_1.Utility.isProto2(fileDescriptor)) {
                            canBeUndefined = true;
                        }
                    }
                    const fieldObjectName = Utility_1.Utility.normaliseFieldObjectName(fieldData.camelCaseName);
                    printerToObjectType.printIndentedLn(`${fieldObjectName}${canBeUndefined ? '?' : ''}: ${fieldObjectType},`);
                    printer.printIndentedLn(`get${fieldData.camelUpperName}(): ${fieldData.exportType}${canBeUndefined ? ' | undefined' : ''};`);
                    printer.printIndentedLn(`set${fieldData.camelUpperName}(value${fieldData.type === FieldTypes_1.MESSAGE_TYPE ? '?' : ''}: ${fieldData.exportType}): void;`);
                }
            }
            printer.printEmptyLn();
        });
        printerToObjectType.printLn(`}`);
        descriptor.getOneofDeclList().forEach(oneOfDecl => {
            printer.printIndentedLn(`get${Utility_1.Utility.oneOfName(oneOfDecl.getName())}Case(): ${messageData.messageName}.${Utility_1.Utility.oneOfName(oneOfDecl.getName())}Case;`);
        });
        printer.printIndentedLn(`serializeBinary(): Uint8Array;`);
        printer.printIndentedLn(`toObject(includeInstance?: boolean): ${messageData.messageName}.${exports.OBJECT_TYPE_NAME};`);
        printer.printIndentedLn(`static toObject(includeInstance: boolean, msg: ${messageData.messageName}): ${messageData.messageName}.${exports.OBJECT_TYPE_NAME};`);
        printer.printIndentedLn(`static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};`);
        printer.printIndentedLn(`static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};`);
        printer.printIndentedLn(`static serializeBinaryToWriter(message: ${messageData.messageName}, writer: jspb.BinaryWriter): void;`);
        printer.printIndentedLn(`static deserializeBinary(bytes: Uint8Array): ${messageData.messageName};`);
        printer.printIndentedLn(`static deserializeBinaryFromReader(message: ${messageData.messageName}, reader: jspb.BinaryReader): ${messageData.messageName};`);
        printer.printLn(`}`);
        printer.printEmptyLn();
        printer.printLn(`export namespace ${messageData.messageName} {`);
        printer.print(printerToObjectType.getOutput());
        descriptor.getNestedTypeList().forEach(nested => {
            const msgOutput = Message.print(fileName, entryMap, nested, indentLevel + 1, fileDescriptor);
            if (msgOutput !== '') {
                // If the message class is a Map entry then it isn't output, so don't print the namespace block
                printer.print(msgOutput);
            }
        });
        descriptor.getEnumTypeList().forEach(enumType => {
            printer.print(`${Enum_1.Enum.print(enumType, indentLevel + 1)}`);
        });
        descriptor.getOneofDeclList().forEach((oneOfDecl, index) => {
            printer.print(`${OneOf_1.OneOf.print(oneOfDecl, oneOfGroups[index] || [], indentLevel + 1)}`);
        });
        descriptor.getExtensionList().forEach(extension => {
            printer.print(Extensions_1.Extension.print(fileName, entryMap, extension, indentLevel + 1));
        });
        printer.printLn(`}`);
        return printer.getOutput();
    }
    Message.print = print;
})(Message = exports.Message || (exports.Message = {}));
