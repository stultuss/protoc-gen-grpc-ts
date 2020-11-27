"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utility = void 0;
const PROTO2_SYNTAX = 'proto2';
var Utility;
(function (Utility) {
    function filePathToPseudoNamespace(filePath) {
        return filePath.replace('.proto', '').replace(/\//g, '_').replace(/\./g, '_').replace(/\-/g, '_') + '_pb';
    }
    Utility.filePathToPseudoNamespace = filePathToPseudoNamespace;
    function snakeToCamel(str) {
        return str.replace(/(\_\w)/g, function (m) {
            return m[1].toUpperCase();
        });
    }
    Utility.snakeToCamel = snakeToCamel;
    function ucFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    Utility.ucFirst = ucFirst;
    function lcFirst(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    Utility.lcFirst = lcFirst;
    function isProto2(fileDescriptor) {
        // Empty syntax defaults to proto2
        return (fileDescriptor.getSyntax() === '' || fileDescriptor.getSyntax() === PROTO2_SYNTAX);
    }
    Utility.isProto2 = isProto2;
    function oneOfName(name) {
        return Utility.ucFirst(Utility.snakeToCamel(name));
    }
    Utility.oneOfName = oneOfName;
    function generateIndent(indentLevel) {
        let indent = '';
        for (let i = 0; i < indentLevel; i++) {
            indent += '  ';
        }
        return indent;
    }
    Utility.generateIndent = generateIndent;
    function getPathToRoot(fileName) {
        const depth = fileName.split('/').length;
        return depth === 1 ? './' : new Array(depth).join('../');
    }
    Utility.getPathToRoot = getPathToRoot;
    function withinNamespaceFromExportEntry(name, exportEntry) {
        return exportEntry.pkg ? name.substring(exportEntry.pkg.length + 1) : name;
    }
    Utility.withinNamespaceFromExportEntry = withinNamespaceFromExportEntry;
    function filePathFromProtoWithoutExtension(protoFilePath) {
        return protoFilePath.replace('.proto', '_pb');
    }
    Utility.filePathFromProtoWithoutExtension = filePathFromProtoWithoutExtension;
    function svcFilePathFromProtoWithoutExtension(protoFilePath) {
        return protoFilePath.replace('.proto', '_grpc_pb');
    }
    Utility.svcFilePathFromProtoWithoutExtension = svcFilePathFromProtoWithoutExtension;
    function withAllStdIn(callback) {
        const ret = [];
        let len = 0;
        const stdin = process.stdin;
        stdin.on('readable', function () {
            let chunk;
            while ((chunk = stdin.read())) {
                if (!(chunk instanceof Buffer))
                    throw new Error('Did not receive buffer');
                ret.push(chunk);
                len += chunk.length;
            }
        });
        stdin.on('end', function () {
            callback(Buffer.concat(ret, len));
        });
    }
    Utility.withAllStdIn = withAllStdIn;
    // normaliseFieldObjectName modifies the field name that appears in the `asObject` representation
    // to match the logic found in `protobuf/compiler/js/js_generator.cc`. See: https://goo.gl/tX1dPQ
    function normaliseFieldObjectName(name) {
        switch (name) {
            case 'abstract':
            case 'boolean':
            case 'break':
            case 'byte':
            case 'case':
            case 'catch':
            case 'char':
            case 'class':
            case 'const':
            case 'continue':
            case 'debugger':
            case 'default':
            case 'delete':
            case 'do':
            case 'double':
            case 'else':
            case 'enum':
            case 'export':
            case 'extends':
            case 'false':
            case 'final':
            case 'finally':
            case 'float':
            case 'for':
            case 'function':
            case 'goto':
            case 'if':
            case 'implements':
            case 'import':
            case 'in':
            case 'instanceof':
            case 'int':
            case 'interface':
            case 'long':
            case 'native':
            case 'new':
            case 'null':
            case 'package':
            case 'private':
            case 'protected':
            case 'public':
            case 'return':
            case 'short':
            case 'static':
            case 'super':
            case 'switch':
            case 'synchronized':
            case 'this':
            case 'throw':
            case 'throws':
            case 'transient':
            case 'try':
            case 'typeof':
            case 'var':
            case 'void':
            case 'volatile':
            case 'while':
            case 'with':
                return `pb_${name}`;
        }
        return name;
    }
    Utility.normaliseFieldObjectName = normaliseFieldObjectName;
})(Utility = exports.Utility || (exports.Utility = {}));
