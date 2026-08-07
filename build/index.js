"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is the ProtoC compiler plugin.
 *
 * It only accepts stdin/stdout output according to the protocol
 * specified in [plugin.proto](https://github.com/google/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto).
 *
 * source code copy from [ts-protoc-gen](https://github.com/improbable-eng/ts-protoc-gen/blob/master/src/index.ts)
 */
const plugin_pb_1 = require("google-protobuf/google/protobuf/compiler/plugin_pb");
const Utility_1 = require("./lib/Utility");
const EntryMap_1 = require("./lib/EntryMap");
const FileDescriptorMSG_1 = require("./lib/descriptor/FileDescriptorMSG");
const FileDescriptorGRPC_1 = require("./lib/descriptor/FileDescriptorGRPC");
Utility_1.Utility.withAllStdIn((input) => {
    const response = new plugin_pb_1.CodeGeneratorResponse();
    try {
        const binary = new Uint8Array(input.length);
        binary.set(input);
        const request = plugin_pb_1.CodeGeneratorRequest.deserializeBinary(binary);
        // protoc joins multiple --ts_out parameters with commas.
        const parameters = request.getParameter().split(',').map(p => p.trim());
        const isGrpcJs = parameters.indexOf('grpc_js') !== -1
            || parameters.indexOf('generate_package_definition') !== -1;
        // Declare support for proto3 optional fields so protoc will invoke
        // the plugin for protos that use them.
        response.setSupportedFeatures(plugin_pb_1.CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL);
        // Parse request proto file
        const fileNameToDescriptor = {};
        const entryMap = new EntryMap_1.EntryMap();
        request.getProtoFileList().forEach((fileDescriptor) => {
            fileNameToDescriptor[fileDescriptor.getName()] = fileDescriptor;
            entryMap.parseFileDescriptor(fileDescriptor);
        });
        // Generate *_pb.d.ts && *_grpc_pb.d.ts
        request.getFileToGenerateList().forEach(fileName => {
            const outputFileName = Utility_1.Utility.filePathFromProtoWithoutExtension(fileName);
            const outputFile = new plugin_pb_1.CodeGeneratorResponse.File();
            outputFile.setName(outputFileName + '.d.ts');
            outputFile.setContent(FileDescriptorMSG_1.FileDescriptorMSG.print(fileNameToDescriptor[fileName], entryMap));
            response.addFile(outputFile);
            const fileDescriptorOutput = FileDescriptorGRPC_1.FileDescriptorGRPC.print(fileNameToDescriptor[fileName], entryMap, isGrpcJs);
            if (fileDescriptorOutput !== '') {
                const thisServiceFileName = Utility_1.Utility.svcFilePathFromProtoWithoutExtension(fileName);
                const thisServiceFile = new plugin_pb_1.CodeGeneratorResponse.File();
                thisServiceFile.setName(thisServiceFileName + '.d.ts');
                thisServiceFile.setContent(fileDescriptorOutput);
                response.addFile(thisServiceFile);
            }
        });
    }
    catch (err) {
        // Report failures through the response so protoc can surface them
        // to the user, instead of dying with a non-zero exit code.
        response.setError(err && err.stack ? err.stack : String(err));
    }
    process.stdout.write(Buffer.from(response.serializeBinary()));
});
