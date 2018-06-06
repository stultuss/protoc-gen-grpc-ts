import {EnumDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';
import {Printer} from '../../Printer';

export namespace Enum {

    export function print(enumDescriptor: EnumDescriptorProto, indentLevel: number): string {

        const printer = new Printer(indentLevel);
        printer.printEmptyLn();
        printer.printLn(`export enum ${enumDescriptor.getName()} {`);
        enumDescriptor.getValueList().forEach(value => {
            printer.printIndentedLn(`${value.getName().toUpperCase()} = ${value.getNumber()},`);
        });
        printer.printLn(`}`);
        return printer.getOutput();
    }

}