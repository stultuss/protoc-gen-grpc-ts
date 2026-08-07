'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {Enum} = require('../../build/lib/descriptor/partial/Enum');
const {enumType} = require('../helpers/proto-builders');

test('Enum.print renders values as uppercase constants', () => {
    const output = Enum.print(enumType('Status', [['UNKNOWN', 0], ['ACTIVE', 1], ['IN_PROGRESS', 2]]), 0);
    assert.equal(output, [
        '',
        'export enum Status {',
        '  UNKNOWN = 0,',
        '  ACTIVE = 1,',
        '  IN_PROGRESS = 2,',
        '}',
        '',
    ].join('\n'));
});

test('Enum.print honours indent level', () => {
    const output = Enum.print(enumType('Color', [['RED', 0]]), 1);
    assert.equal(output, '\n  export enum Color {\n    RED = 0,\n  }\n');
});

test('Enum.print handles an empty value list', () => {
    const output = Enum.print(enumType('Empty', []), 0);
    assert.match(output, /export enum Empty \{\n\}/);
});
