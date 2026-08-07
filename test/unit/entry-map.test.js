'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {EntryMap} = require('../../build/lib/EntryMap');
const {T, L, field, oneof, enumType, message, mapEntry, fileDescriptor} = require('../helpers/proto-builders');

test('parseFileDescriptor indexes top-level and nested messages and enums', () => {
    const fd = fileDescriptor({
        name: 'a.proto',
        pkg: 'com.example',
        syntax: 'proto3',
        messages: [
            message('Outer', {
                fields: [field('name', 1, T.TYPE_STRING)],
                nestedMessages: [message('Inner', {fields: [field('id', 1, T.TYPE_INT64)]})],
                enums: [enumType('NestedEnum', [['A', 0]])],
            }),
            message('Plain', {fields: []}),
        ],
        enums: [enumType('TopEnum', [['X', 0]])],
    });

    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);

    assert.deepEqual(Object.keys(entryMap.messageEntryMap).sort(), ['com.example.Outer', 'com.example.Outer.Inner', 'com.example.Plain']);
    assert.deepEqual(Object.keys(entryMap.enumEntryMap).sort(), ['com.example.Outer.NestedEnum', 'com.example.TopEnum']);

    const outer = entryMap.getMessageEntry('com.example.Outer');
    assert.equal(outer.pkg, 'com.example');
    assert.equal(outer.fileName, 'a.proto');
    assert.equal(entryMap.getMessageEntry('com.example.Outer.Inner').fileName, 'a.proto');
    assert.equal(entryMap.getEnumEntry('com.example.TopEnum').pkg, 'com.example');
    assert.equal(entryMap.getEnumEntry('com.example.Outer.NestedEnum').pkg, 'com.example');
});

test('parseFileDescriptor works without a package', () => {
    const fd = fileDescriptor({
        name: 'nopkg.proto',
        messages: [message('Foo', {fields: []})],
        enums: [enumType('Bar', [['B', 0]])],
    });
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);
    assert.equal(entryMap.getMessageEntry('Foo').pkg, '');
    // Current behaviour: enum keys keep a leading dot when there is no package,
    // so lookups with the bare name fail. (Known limitation.)
    assert.equal(entryMap.getEnumEntry('Bar'), undefined);
    assert.equal(entryMap.getEnumEntry('.Bar').pkg, '');
});

test('parseFileDescriptor records map entry options for map-entry messages', () => {
    const fd = fileDescriptor({
        name: 'm.proto',
        pkg: 'com.m',
        messages: [
            message('Holder', {
                nestedMessages: [mapEntry('ListEntry', T.TYPE_INT64, undefined, T.TYPE_MESSAGE, '.com.m.Item')],
            }),
        ],
    });
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);

    const mapEntryInfo = entryMap.getMessageEntry('com.m.Holder.ListEntry');
    assert.equal(mapEntryInfo.messageOptions.getMapEntry(), true);
    assert.deepEqual(mapEntryInfo.mapFieldOptions.key, [T.TYPE_INT64, '']);
    assert.deepEqual(mapEntryInfo.mapFieldOptions.value, [T.TYPE_MESSAGE, 'com.m.Item']);
});

test('parseFileDescriptor records non-map messages without mapFieldOptions', () => {
    const fd = fileDescriptor({
        name: 'm.proto',
        pkg: 'com.m',
        messages: [message('Plain', {fields: [field('id', 1, T.TYPE_INT64)]})],
    });
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);
    const entry = entryMap.getMessageEntry('com.m.Plain');
    assert.equal(entry.mapFieldOptions, undefined);
    assert.equal(entry.messageOptions, undefined);
});

test('getMessageEntry / getEnumEntry return undefined for unknown names', () => {
    const entryMap = new EntryMap();
    assert.equal(entryMap.getMessageEntry('nope.Missing'), undefined);
    assert.equal(entryMap.getEnumEntry('nope.Missing'), undefined);
});

test('parseFileDescriptor can be called multiple times and accumulates entries', () => {
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fileDescriptor({name: 'one.proto', pkg: 'p', messages: [message('A', {fields: []})]}));
    entryMap.parseFileDescriptor(fileDescriptor({name: 'two.proto', pkg: 'p', messages: [message('B', {fields: []})]}));
    assert.ok(entryMap.getMessageEntry('p.A'));
    assert.ok(entryMap.getMessageEntry('p.B'));
});

test('oneof fields are not specially indexed but messages still parse', () => {
    const fd = fileDescriptor({
        name: 'o.proto',
        pkg: 'com.o',
        messages: [
            message('Choice', {
                oneofs: [oneof('pick')],
                fields: [field('a', 1, T.TYPE_STRING, {oneofIndex: 0})],
            }),
        ],
    });
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);
    assert.equal(entryMap.getMessageEntry('com.o.Choice').pkg, 'com.o');
});

test('repeated fields and labels parse without error', () => {
    const fd = fileDescriptor({
        name: 'r.proto',
        pkg: 'com.r',
        messages: [
            message('Repeated', {
                fields: [field('items', 1, T.TYPE_STRING, {label: L.LABEL_REPEATED})],
            }),
        ],
    });
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);
    assert.ok(entryMap.getMessageEntry('com.r.Repeated'));
});
