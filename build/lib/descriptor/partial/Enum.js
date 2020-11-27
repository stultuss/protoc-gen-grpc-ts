"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = void 0;
const Printer_1 = require("../../Printer");
var Enum;
(function (Enum) {
    function print(enumDescriptor, indentLevel) {
        const printer = new Printer_1.Printer(indentLevel);
        printer.printEmptyLn();
        printer.printLn(`export enum ${enumDescriptor.getName()} {`);
        enumDescriptor.getValueList().forEach(value => {
            printer.printIndentedLn(`${value.getName().toUpperCase()} = ${value.getNumber()},`);
        });
        printer.printLn(`}`);
        return printer.getOutput();
    }
    Enum.print = print;
})(Enum = exports.Enum || (exports.Enum = {}));
