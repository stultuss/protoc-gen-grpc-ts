import {FileDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';

import {EntryMap} from '../EntryMap';
import {Utility} from '../Utility';
import {Printer} from '../Printer';
import {DependencyTypesMap} from '../DependencyTypesMap';

import {Message} from './partial/Message';
import {Enum} from './partial/Enum';
import {Extension} from './partial/Extensions';

export namespace FileDescriptorMSG {

    export function print(fileDescriptor: FileDescriptorProto, entryMap: EntryMap) {
        const fileName = fileDescriptor.getName();
        const packageName = fileDescriptor.getPackage();

        const printer = new Printer(0);

        printer.printLn(`// package: ${packageName}`);
        printer.printLn(`// file: ${fileDescriptor.getName()}`);
        printer.printEmptyLn();

        const upToRoot = Utility.getPathToRoot(fileName);

        printer.printLn(`import * as jspb from 'google-protobuf';`);

        fileDescriptor.getDependencyList().forEach((dependency: string) => {
            const pseudoNamespace = Utility.filePathToPseudoNamespace(dependency);
            if (dependency in DependencyTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${DependencyTypesMap[dependency]}';`);
            } else {
                const filePath = Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot}${filePath}';`);
            }
        });

        fileDescriptor.getMessageTypeList().forEach(enumType => {
            printer.print(Message.print(fileName, entryMap, enumType, 0, fileDescriptor));
        });

        fileDescriptor.getExtensionList().forEach(extension => {
            printer.print(Extension.print(fileName, entryMap, extension, 0));
        });

        fileDescriptor.getEnumTypeList().forEach(enumType => {
            printer.print(Enum.print(enumType, 0));
        });

        printer.printEmptyLn();

        return printer.getOutput();
    }

}