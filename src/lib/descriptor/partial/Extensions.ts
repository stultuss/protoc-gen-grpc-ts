import {FieldDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';
import {Printer} from '../../Printer';
import {ExportMap} from '../../ExportMap';
import {Utility} from '../../Utility';
import {FieldTypes} from './FieldTypes';

export namespace Extension {

    export function print(fileName: string, exportMap: ExportMap, fieldsDescriptor: FieldDescriptorProto, indentLevel: number): string {

        const extensionName = Utility.snakeToCamel(fieldsDescriptor.getName());
        const fieldType = FieldTypes.getFieldType(fieldsDescriptor.getType(), fieldsDescriptor.getTypeName().slice(1), fileName, exportMap);

        const printer = new Printer(indentLevel + 1);
        printer.printEmptyLn();
        printer.printLn(`export const ${extensionName}: jspb.ExtensionFieldInfo<${fieldType}>;`);
        return printer.output;
    }

}