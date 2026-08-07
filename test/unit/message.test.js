'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {Message} = require('../../build/lib/descriptor/partial/Message');
const {EntryMap} = require('../../build/lib/EntryMap');
const {
    T,
    L,
    field,
    oneof,
    enumType,
    message,
    mapEntry,
    fileDescriptor,
} = require('../helpers/proto-builders');

function entryMapFor(fd) {
    const entryMap = new EntryMap();
    entryMap.parseFileDescriptor(fd);
    return entryMap;
}

function printTopLevel(fd, descriptorIndex = 0) {
    return Message.print(fd.getName(), entryMapFor(fd), fd.getMessageTypeList()[descriptorIndex], 0, fd);
}

test('simple proto3 scalar message renders exact output', () => {
    const fd = fileDescriptor({
        name: 'a.proto',
        pkg: 'com.p',
        syntax: 'proto3',
        messages: [message('P', {fields: [field('id', 1, T.TYPE_INT64), field('name', 2, T.TYPE_STRING)]})],
    });
    const expected = [
        '',
        'export class P extends jspb.Message {',
        '  getId(): number;',
        '  setId(value: number): void;',
        '',
        '  getName(): string;',
        '  setName(value: string): void;',
        '',
        '  serializeBinary(): Uint8Array;',
        '  toObject(includeInstance?: boolean): P.AsObject;',
        '  static toObject(includeInstance: boolean, msg: P): P.AsObject;',
        '  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};',
        '  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};',
        '  static serializeBinaryToWriter(message: P, writer: jspb.BinaryWriter): void;',
        '  static deserializeBinary(bytes: Uint8Array): P;',
        '  static deserializeBinaryFromReader(message: P, reader: jspb.BinaryReader): P;',
        '}',
        '',
        'export namespace P {',
        '  export type AsObject = {',
        '    id: number,',
        '    name: string,',
        '  }',
        '}',
        '',
    ].join('\n');
    assert.equal(printTopLevel(fd), expected);
});

test('proto2 scalar fields get has/clear and optional AsObject', () => {
    const fd = fileDescriptor({
        name: 'b.proto',
        pkg: 'com.p',
        syntax: 'proto2',
        messages: [message('Q', {fields: [field('opt', 1, T.TYPE_INT32, {label: L.LABEL_OPTIONAL})]})],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  hasOpt\(\): boolean;/);
    assert.match(output, /  clearOpt\(\): void;/);
    assert.match(output, /  getOpt\(\): number \| undefined;/);
    assert.match(output, /    opt\?: number,/);
});

test('hasFieldPresence rules', () => {
    const proto3 = fileDescriptor({name: 'p3.proto', syntax: 'proto3'});
    const proto2 = fileDescriptor({name: 'p2.proto', syntax: 'proto2'});
    const repeated = field('r', 1, T.TYPE_STRING, {label: L.LABEL_REPEATED});
    const oneofField = field('o', 1, T.TYPE_STRING, {oneofIndex: 0});
    const msgField = field('m', 1, T.TYPE_MESSAGE, {typeName: '.x.Y'});
    const scalar = field('s', 1, T.TYPE_STRING);

    assert.equal(Message.hasFieldPresence(repeated, proto3), false);
    assert.equal(Message.hasFieldPresence(oneofField, proto3), true);
    assert.equal(Message.hasFieldPresence(msgField, proto3), true);
    assert.equal(Message.hasFieldPresence(scalar, proto3), false);
    assert.equal(Message.hasFieldPresence(scalar, proto2), true);
});

test('bytes fields render singular and repeated accessors', () => {
    const fd = fileDescriptor({
        name: 'by.proto',
        pkg: 'com.b',
        syntax: 'proto3',
        messages: [message('Blob', {
            fields: [
                field('data', 1, T.TYPE_BYTES),
                field('items', 2, T.TYPE_BYTES, {label: L.LABEL_REPEATED}),
            ],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  getData\(\): Uint8Array \| string;/);
    assert.match(output, /  getData_asU8\(\): Uint8Array;/);
    assert.match(output, /  getData_asB64\(\): string;/);
    assert.match(output, /  setData\(value: Uint8Array \| string\): void;/);
    assert.match(output, /  getItemsList\(\): Array<Uint8Array \| string>;/);
    assert.match(output, /  getItemsList_asU8\(\): Array<Uint8Array>;/);
    assert.match(output, /  getItemsList_asB64\(\): Array<string>;/);
    assert.match(output, /  addItems\(value: Uint8Array \| string, index\?: number\): Uint8Array \| string;/);
    assert.match(output, /    itemsList: Array<Uint8Array \| string>,/);
});

test('reserved word field names are prefixed with pb_ in AsObject', () => {
    const fd = fileDescriptor({
        name: 'kw.proto',
        pkg: 'com.k',
        syntax: 'proto3',
        messages: [message('Kw', {fields: [field('default', 1, T.TYPE_BOOL), field('class', 2, T.TYPE_STRING)]})],
    });
    const output = printTopLevel(fd);
    assert.match(output, /    pb_default: boolean,/);
    assert.match(output, /    pb_class: string,/);
    assert.match(output, /  getDefault\(\): boolean;/);
});

test('oneof fields render case accessor and enum', () => {
    const fd = fileDescriptor({
        name: 'oo.proto',
        pkg: 'com.o',
        syntax: 'proto3',
        messages: [message('Choice', {
            oneofs: [oneof('payment')],
            fields: [
                field('cash', 1, T.TYPE_INT64, {oneofIndex: 0}),
                field('card', 2, T.TYPE_STRING, {oneofIndex: 0}),
            ],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  hasCash\(\): boolean;/);
    assert.match(output, /  getCash\(\): number;/);
    assert.match(output, /  getPaymentCase\(\): Choice\.PaymentCase;/);
    assert.match(output, /  export enum PaymentCase \{\n    PAYMENT_NOT_SET = 0,\n    CASH = 1,\n    CARD = 2,\n  \}/);
});

test('map fields render jspb.Map getter and tuple AsObject', () => {
    const fd = fileDescriptor({
        name: 'mp.proto',
        pkg: 'com.m',
        syntax: 'proto3',
        messages: [
            message('Item', {fields: [field('id', 1, T.TYPE_INT64)]}),
            message('Shop', {
                fields: [
                    field('list', 1, T.TYPE_MESSAGE, {label: L.LABEL_REPEATED, typeName: '.com.m.Shop.ListEntry'}),
                ],
                nestedMessages: [mapEntry('ListEntry', T.TYPE_INT64, undefined, T.TYPE_MESSAGE, '.com.m.Item')],
            }),
        ],
    });
    const output = printTopLevel(fd, 1);
    assert.match(output, /  getListMap\(\): jspb\.Map<number, Item>;/);
    assert.match(output, /  clearListMap\(\): void;/);
    assert.match(output, /    listMap: Array<\[number, Item\.AsObject\]>,/);
});

test('map fields with bytes values render Uint8Array | string', () => {
    const fd = fileDescriptor({
        name: 'mbytes.proto',
        pkg: 'com.m',
        syntax: 'proto3',
        messages: [message('FileBag', {
            fields: [
                field('files', 1, T.TYPE_MESSAGE, {label: L.LABEL_REPEATED, typeName: '.com.m.FileBag.FilesEntry'}),
            ],
            nestedMessages: [mapEntry('FilesEntry', T.TYPE_STRING, undefined, T.TYPE_BYTES, undefined)],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  getFilesMap\(\): jspb\.Map<string, Uint8Array \| string>;/);
    assert.match(output, /    filesMap: Array<\[string, Uint8Array \| string\]>,/);
});

test('map fields with scalar values render plain types', () => {
    const fd = fileDescriptor({
        name: 'mscalar.proto',
        pkg: 'com.m',
        syntax: 'proto3',
        messages: [message('ScoreBoard', {
            fields: [
                field('scores', 1, T.TYPE_MESSAGE, {label: L.LABEL_REPEATED, typeName: '.com.m.ScoreBoard.ScoresEntry'}),
            ],
            nestedMessages: [mapEntry('ScoresEntry', T.TYPE_STRING, undefined, T.TYPE_INT64, undefined)],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  getScoresMap\(\): jspb\.Map<string, number>;/);
    assert.match(output, /    scoresMap: Array<\[string, number\]>,/);
});

test('map-entry messages themselves are not emitted', () => {
    const fd = fileDescriptor({
        name: 'me.proto',
        pkg: 'com.m',
        messages: [message('Holder', {
            nestedMessages: [mapEntry('ListEntry', T.TYPE_INT64, undefined, T.TYPE_STRING, undefined)],
        })],
    });
    const entryMap = entryMapFor(fd);
    const holder = fd.getMessageTypeList()[0];
    const entryOutput = Message.print(fd.getName(), entryMap, holder.getNestedTypeList()[0], 1, fd);
    assert.equal(entryOutput, '');
    const holderOutput = Message.print(fd.getName(), entryMap, holder, 0, fd);
    assert.equal(holderOutput.includes('class ListEntry'), false);
});

test('nested messages and enums render inside the namespace', () => {
    const fd = fileDescriptor({
        name: 'ne.proto',
        pkg: 'com.n',
        syntax: 'proto3',
        messages: [message('Outer', {
            fields: [
                field('kind', 1, T.TYPE_MESSAGE, {typeName: '.com.n.Outer.Kind'}),
                field('status', 2, T.TYPE_ENUM, {typeName: '.com.n.Outer.Status'}),
            ],
            nestedMessages: [message('Kind', {fields: [field('label', 1, T.TYPE_STRING)]})],
            enums: [enumType('Status', [['OK', 0]])],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  getKind\(\): Outer\.Kind \| undefined;/);
    assert.match(output, /  getStatus\(\): Outer\.Status;/);
    assert.match(output, /  export class Kind extends jspb\.Message \{/);
    assert.match(output, /  export enum Status \{\n    OK = 0,\n  \}/);
    assert.match(output, /    kind\?: Outer\.Kind\.AsObject,/);
});

test('cross-file message fields resolve to the pseudo namespace', () => {
    const fd = fileDescriptor({
        name: 'cf.proto',
        pkg: 'com.cf',
        syntax: 'proto3',
        messages: [message('Holder', {
            fields: [field('ext', 1, T.TYPE_MESSAGE, {typeName: '.other.types.External'})],
        })],
    });
    const entryMap = entryMapFor(fd);
    const external = fileDescriptor({
        name: 'other/types.proto',
        pkg: 'other.types',
        syntax: 'proto3',
        messages: [message('External', {fields: [field('v', 1, T.TYPE_STRING)]})],
    });
    entryMap.parseFileDescriptor(external);
    const output = Message.print('cf.proto', entryMap, fd.getMessageTypeList()[0], 0, fd);
    assert.match(output, /  getExt\(\): other_types_pb\.External \| undefined;/);
    assert.match(output, /    ext\?: other_types_pb\.External\.AsObject,/);
});

test('cross-file enum fields resolve to the pseudo namespace', () => {
    const fd = fileDescriptor({
        name: 'ce.proto',
        pkg: 'com.ce',
        syntax: 'proto3',
        messages: [message('Holder', {
            fields: [field('kind', 1, T.TYPE_ENUM, {typeName: '.other.enums.Kind'})],
        })],
    });
    const entryMap = entryMapFor(fd);
    entryMap.parseFileDescriptor(fileDescriptor({
        name: 'other/enums.proto',
        pkg: 'other.enums',
        syntax: 'proto3',
        enums: [enumType('Kind', [['KIND_UNKNOWN', 0]])],
    }));
    const output = Message.print('ce.proto', entryMap, fd.getMessageTypeList()[0], 0, fd);
    assert.match(output, /  getKind\(\): other_enums_pb\.Kind;/);
    assert.match(output, /    kind: other_enums_pb\.Kind,/);
});

test('message-level extensions render inside the namespace', () => {
    const fd = fileDescriptor({
        name: 'mext.proto',
        pkg: 'com.m',
        syntax: 'proto3',
        messages: [message('WithExt', {
            fields: [field('id', 1, T.TYPE_INT64)],
            extensions: [field('extra', 100, T.TYPE_INT32)],
        })],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  export const extra: jspb\.ExtensionFieldInfo<number>;/);
});

test('missing message entry throws with the full type name', () => {
    const fd = fileDescriptor({
        name: 'err.proto',
        pkg: 'com.e',
        messages: [message('Bad', {fields: [field('m', 1, T.TYPE_MESSAGE, {typeName: '.missing.Type'})]})],
    });
    assert.throws(() => printTopLevel(fd), /No message export for: missing\.Type/);
});

test('missing enum entry throws with the full type name', () => {
    const fd = fileDescriptor({
        name: 'err.proto',
        pkg: 'com.e',
        messages: [message('Bad', {fields: [field('e', 1, T.TYPE_ENUM, {typeName: '.missing.Enum'})]})],
    });
    assert.throws(() => printTopLevel(fd), /No enum export for: missing\.Enum/);
});

test('field names are lowercased before camel-casing', () => {
    const fd = fileDescriptor({
        name: 'lc.proto',
        pkg: 'com.l',
        syntax: 'proto3',
        messages: [message('Lc', {fields: [field('USER_ID', 1, T.TYPE_INT64)]})],
    });
    const output = printTopLevel(fd);
    assert.match(output, /  getUserId\(\): number;/);
    assert.match(output, /    userId: number,/);
});
