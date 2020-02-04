import {FieldDescriptorProto, OneofDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';
import {Printer} from '../../Printer';
import {Utility} from '../../Utility';

export namespace OneOf {

    export function print(oneOfDescriptor: OneofDescriptorProto, fieldsDescriptor: Array<FieldDescriptorProto>, indentLevel: number): string {

        let oneOfName = Utility.oneOfName(oneOfDescriptor.getName());
        let oneOfNameUpper = oneOfDescriptor.getName().toUpperCase();

        const printer = new Printer(indentLevel);
        printer.printEmptyLn();
        printer.printLn(`export enum ${oneOfName}Case {`);
        printer.printIndentedLn(`${oneOfNameUpper}_NOT_SET = 0,`);
        fieldsDescriptor.forEach(field => {
            printer.printIndentedLn(`${field.getName().toUpperCase()} = ${field.getNumber()},`);
        });
        printer.printLn('}');

        return printer.output;
    }

}