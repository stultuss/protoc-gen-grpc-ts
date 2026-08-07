'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {Printer} = require('../../build/lib/Printer');

test('Printer accumulates output from every method', () => {
    const printer = new Printer(0);
    printer.printLn('a');
    printer.print('b');
    printer.printEmptyLn();
    printer.printIndentedLn('c');
    assert.equal(printer.getOutput(), 'a\nb\n  c\n');
});

test('Printer applies indentation level to printLn', () => {
    const printer = new Printer(2);
    printer.printLn('a');
    printer.printIndentedLn('b');
    assert.equal(printer.getOutput(), '    a\n      b\n');
});

test('Printer starts empty', () => {
    assert.equal(new Printer(0).getOutput(), '');
});

test('printIndentedLn adds exactly two extra spaces', () => {
    const printer = new Printer(1);
    printer.printIndentedLn('x');
    assert.equal(printer.getOutput(), '    x\n');
});
