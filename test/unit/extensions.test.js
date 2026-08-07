'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {Extension} = require('../../build/lib/descriptor/partial/Extensions');
const {T, field} = require('../helpers/proto-builders');

test('Extension.print renders scalar extension fields', () => {
    const output = Extension.print('a.proto', {}, field('kitchen_tag', 100, T.TYPE_INT32), 0);
    assert.equal(output, '\n  export const kitchenTag: jspb.ExtensionFieldInfo<number>;\n');
});

test('Extension.print camel-cases snake_case extension names', () => {
    const output = Extension.print('a.proto', {}, field('my_ext_name', 1, T.TYPE_STRING), 0);
    assert.equal(output, '\n  export const myExtName: jspb.ExtensionFieldInfo<string>;\n');
});

test('Extension.print resolves message-typed extensions via the entry map', () => {
    const entryMap = {getMessageEntry: () => ({pkg: 'com.kitchen', fileName: 'kitchen/product.proto'})};
    const output = Extension.print('a.proto', entryMap, field('ref', 1, T.TYPE_MESSAGE, {typeName: '.com.kitchen.Meta'}), 0);
    assert.equal(output, '\n  export const ref: jspb.ExtensionFieldInfo<kitchen_product_pb.Meta>;\n');
});
