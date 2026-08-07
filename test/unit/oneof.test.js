'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {OneOf} = require('../../build/lib/descriptor/partial/OneOf');
const {oneof, field, T} = require('../helpers/proto-builders');

test('OneOf.print renders the Case enum with NOT_SET and field numbers', () => {
    const fields = [
        field('cash', 1, T.TYPE_INT64),
        field('card', 2, T.TYPE_STRING),
    ];
    const output = OneOf.print(oneof('payment'), fields, 0);
    assert.equal(output, [
        '',
        'export enum PaymentCase {',
        '  PAYMENT_NOT_SET = 0,',
        '  CASH = 1,',
        '  CARD = 2,',
        '}',
    ].join('\n') + '\n');
});

test('OneOf.print handles snake_case oneof names and empty fields', () => {
    const output = OneOf.print(oneof('foo_bar'), [], 0);
    assert.match(output, /export enum FooBarCase \{\n  FOO_BAR_NOT_SET = 0,\n\}/);
});

test('OneOf.print honours indent level', () => {
    const output = OneOf.print(oneof('pick'), [field('a', 1, T.TYPE_STRING)], 1);
    assert.equal(output, '\n  export enum PickCase {\n    PICK_NOT_SET = 0,\n    A = 1,\n  }\n');
});
