"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utility_1 = require("../Utility");
const Printer_1 = require("../Printer");
const WellKnown_1 = require("../WellKnown");
const Message_1 = require("./partial/Message");
const Enum_1 = require("./partial/Enum");
const Extensions_1 = require("./partial/Extensions");
var FileDescriptorTSD;
(function (FileDescriptorTSD) {
    function print(fileDescriptor, exportMap) {
        const fileName = fileDescriptor.getName();
        const packageName = fileDescriptor.getPackage();
        const printer = new Printer_1.Printer(0);
        printer.printLn(`// package: ${packageName}`);
        printer.printLn(`// file: ${fileDescriptor.getName()}`);
        printer.printEmptyLn();
        printer.printLn(`/* tslint:disable */`);
        const upToRoot = Utility_1.Utility.getPathToRoot(fileName);
        printer.printEmptyLn();
        printer.printLn(`import * as jspb from 'google-protobuf';`);
        fileDescriptor.getDependencyList().forEach((dependency) => {
            const pseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(dependency);
            if (dependency in WellKnown_1.WellKnownTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${WellKnown_1.WellKnownTypesMap[dependency]}';`);
            }
            else {
                const filePath = Utility_1.Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot}${filePath}';`);
            }
        });
        fileDescriptor.getMessageTypeList().forEach(enumType => {
            printer.print(Message_1.Message.print(fileName, exportMap, enumType, 0, fileDescriptor));
        });
        fileDescriptor.getExtensionList().forEach(extension => {
            printer.print(Extensions_1.Extension.print(fileName, exportMap, extension, 0));
        });
        fileDescriptor.getEnumTypeList().forEach(enumType => {
            printer.print(Enum_1.Enum.print(enumType, 0));
        });
        printer.printEmptyLn();
        return printer.getOutput();
    }
    FileDescriptorTSD.print = print;
})(FileDescriptorTSD = exports.FileDescriptorTSD || (exports.FileDescriptorTSD = {}));
