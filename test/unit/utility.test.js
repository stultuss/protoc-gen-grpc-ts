'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {FileDescriptorProto} = require('google-protobuf/google/protobuf/descriptor_pb');
const {Utility} = require('../../build/lib/Utility');

const RESERVED_WORDS = [
    'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else',
    'enum', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for',
    'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int',
    'interface', 'long', 'native', 'new', 'null', 'package', 'private',
    'protected', 'public', 'return', 'short', 'static', 'super', 'switch',
    'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'typeof',
    'var', 'void', 'volatile', 'while', 'with',
];

test('filePathToPseudoNamespace replaces slashes, dots and dashes', () => {
    assert.equal(Utility.filePathToPseudoNamespace('product.proto'), 'product_pb');
    assert.equal(Utility.filePathToPseudoNamespace('dir/sub.proto'), 'dir_sub_pb');
    assert.equal(Utility.filePathToPseudoNamespace('a.b/c-d.proto'), 'a_b_c_d_pb');
    assert.equal(Utility.filePathToPseudoNamespace('google/protobuf/empty.proto'), 'google_protobuf_empty_pb');
    assert.equal(Utility.filePathToPseudoNamespace(''), '_pb');
});

test('snakeToCamel converts snake_case to lower camelCase', () => {
    assert.equal(Utility.snakeToCamel('foo_bar'), 'fooBar');
    assert.equal(Utility.snakeToCamel('foo'), 'foo');
    assert.equal(Utility.snakeToCamel('_foo'), 'Foo');
    // \w includes underscore, so "__" collapses without a change
    assert.equal(Utility.snakeToCamel('foo__bar'), 'foo_bar');
    assert.equal(Utility.snakeToCamel(''), '');
});

test('ucFirst / lcFirst', () => {
    assert.equal(Utility.ucFirst('abc'), 'Abc');
    assert.equal(Utility.ucFirst(''), '');
    assert.equal(Utility.ucFirst('ABC'), 'ABC');
    assert.equal(Utility.lcFirst('ABC'), 'aBC');
    assert.equal(Utility.lcFirst(''), '');
    assert.equal(Utility.lcFirst('a'), 'a');
});

test('isProto2: empty syntax defaults to proto2', () => {
    const fd = new FileDescriptorProto();
    assert.equal(Utility.isProto2(fd), true);
    fd.setSyntax('proto2');
    assert.equal(Utility.isProto2(fd), true);
    fd.setSyntax('proto3');
    assert.equal(Utility.isProto2(fd), false);
    fd.setSyntax('editions');
    assert.equal(Utility.isProto2(fd), false);
});

test('oneOfName', () => {
    assert.equal(Utility.oneOfName('foo_bar'), 'FooBar');
    assert.equal(Utility.oneOfName('abc'), 'Abc');
    assert.equal(Utility.oneOfName('_name'), 'Name');
    assert.equal(Utility.oneOfName(''), '');
});

test('generateIndent', () => {
    assert.equal(Utility.generateIndent(0), '');
    assert.equal(Utility.generateIndent(1), '  ');
    assert.equal(Utility.generateIndent(3), '      ');
});

test('getPathToRoot', () => {
    assert.equal(Utility.getPathToRoot('a.proto'), './');
    assert.equal(Utility.getPathToRoot('dir/a.proto'), '../');
    assert.equal(Utility.getPathToRoot('a/b/c.proto'), '../../');
});

test('withinNamespaceFromExportEntry strips the package prefix', () => {
    assert.equal(Utility.withinNamespaceFromExportEntry('com.product.Product', {pkg: 'com.product'}), 'Product');
    assert.equal(Utility.withinNamespaceFromExportEntry('Product', {pkg: ''}), 'Product');
});

test('filePathFromProtoWithoutExtension / svcFilePathFromProtoWithoutExtension', () => {
    assert.equal(Utility.filePathFromProtoWithoutExtension('a.proto'), 'a_pb');
    assert.equal(Utility.filePathFromProtoWithoutExtension('x/y.proto'), 'x/y_pb');
    assert.equal(Utility.svcFilePathFromProtoWithoutExtension('a.proto'), 'a_grpc_pb');
    assert.equal(Utility.svcFilePathFromProtoWithoutExtension('x/y.proto'), 'x/y_grpc_pb');
});

test('normaliseFieldObjectName prefixes all reserved words with pb_', () => {
    RESERVED_WORDS.forEach(word => {
        assert.equal(Utility.normaliseFieldObjectName(word), `pb_${word}`, word);
    });
    assert.equal(Utility.normaliseFieldObjectName('fooBar'), 'fooBar');
    assert.equal(Utility.normaliseFieldObjectName('id'), 'id');
});

test('withAllStdIn concatenates all chunks', async () => {
    const original = process.stdin;
    const stdin = createFakeStdin();
    Object.defineProperty(process, 'stdin', {value: stdin, configurable: true});
    try {
        const promise = new Promise((resolve, reject) => {
            Utility.withAllStdIn(buffer => {
                try {
                    resolve(buffer.toString('utf8'));
                } catch (err) {
                    reject(err);
                }
            });
        });
        stdin.emitReadable(Buffer.from('hello '));
        stdin.emitReadable(Buffer.from('world'));
        stdin.emitEnd();
        assert.equal(await promise, 'hello world');
    } finally {
        Object.defineProperty(process, 'stdin', {value: original, configurable: true});
    }
});

test('withAllStdIn handles empty input', async () => {
    const original = process.stdin;
    const stdin = createFakeStdin();
    Object.defineProperty(process, 'stdin', {value: stdin, configurable: true});
    try {
        const promise = new Promise(resolve => {
            Utility.withAllStdIn(buffer => resolve(buffer.length));
        });
        stdin.emitEnd();
        assert.equal(await promise, 0);
    } finally {
        Object.defineProperty(process, 'stdin', {value: original, configurable: true});
    }
});

test('withAllStdIn throws on non-buffer chunk', () => {
    const original = process.stdin;
    const stdin = createFakeStdin();
    Object.defineProperty(process, 'stdin', {value: stdin, configurable: true});
    try {
        assert.throws(() => {
            Utility.withAllStdIn(() => {});
            stdin.emitReadable('not a buffer');
        }, /Did not receive buffer/);
    } finally {
        Object.defineProperty(process, 'stdin', {value: original, configurable: true});
    }
});

function createFakeStdin() {
    const chunks = [];
    const listeners = {};
    return {
        on(event, cb) {
            (listeners[event] = listeners[event] || []).push(cb);
            return this;
        },
        read() {
            return chunks.length ? chunks.shift() : null;
        },
        emitReadable(chunk) {
            chunks.push(chunk);
            (listeners.readable || []).forEach(cb => cb());
        },
        emitEnd() {
            (listeners.end || []).forEach(cb => cb());
        },
    };
}
