"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Printer = void 0;
const Utility_1 = require("./Utility");
class Printer {
    constructor(indentLevel) {
        this.output = '';
        this.indentStr = Utility_1.Utility.generateIndent(indentLevel);
    }
    printLn(str) {
        this.output += this.indentStr + str + '\n';
    }
    print(str) {
        this.output += str;
    }
    printEmptyLn() {
        this.output += '\n';
    }
    printIndentedLn(str) {
        this.output += this.indentStr + '  ' + str + '\n';
    }
    getOutput() {
        return this.output;
    }
}
exports.Printer = Printer;
