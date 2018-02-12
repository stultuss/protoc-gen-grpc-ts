import {Utility} from './Utility';

export class Printer {
    indentStr: string;
    output: string = '';

    constructor(indentLevel: number) {
        this.indentStr = Utility.generateIndent(indentLevel);
    }

    printLn(str: string) {
        this.output += this.indentStr + str + '\n';
    }

    print(str: string) {
        this.output += str;
    }

    printEmptyLn() {
        this.output += '\n';
    }

    printIndentedLn(str: string) {
        this.output += this.indentStr + '  ' + str + '\n';
    }

    getOutput(): string {
        return this.output;
    }
}
