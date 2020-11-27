"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDescriptorMSG = void 0;
const Utility_1 = require("../Utility");
const Printer_1 = require("../Printer");
const DependencyTypesMap_1 = require("../DependencyTypesMap");
const Message_1 = require("./partial/Message");
const Enum_1 = require("./partial/Enum");
const Extensions_1 = require("./partial/Extensions");
var FileDescriptorMSG;
(function (FileDescriptorMSG) {
    function print(fileDescriptor, entryMap) {
        const fileName = fileDescriptor.getName();
        const packageName = fileDescriptor.getPackage();
        const printer = new Printer_1.Printer(0);
        printer.printLn(`// package: ${packageName}`);
        printer.printLn(`// file: ${fileDescriptor.getName()}`);
        printer.printEmptyLn();
        const upToRoot = Utility_1.Utility.getPathToRoot(fileName);
        printer.printLn(`import * as jspb from 'google-protobuf';`);
        fileDescriptor.getDependencyList().forEach((dependency) => {
            const pseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(dependency);
            if (dependency in DependencyTypesMap_1.DependencyTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${DependencyTypesMap_1.DependencyTypesMap[dependency]}';`);
            }
            else {
                const filePath = Utility_1.Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot}${filePath}';`);
            }
        });
        fileDescriptor.getMessageTypeList().forEach(enumType => {
            printer.print(Message_1.Message.print(fileName, entryMap, enumType, 0, fileDescriptor));
        });
        fileDescriptor.getExtensionList().forEach(extension => {
            printer.print(Extensions_1.Extension.print(fileName, entryMap, extension, 0));
        });
        fileDescriptor.getEnumTypeList().forEach(enumType => {
            printer.print(Enum_1.Enum.print(enumType, 0));
        });
        printer.printEmptyLn();
        return printer.getOutput();
    }
    FileDescriptorMSG.print = print;
})(FileDescriptorMSG = exports.FileDescriptorMSG || (exports.FileDescriptorMSG = {}));
