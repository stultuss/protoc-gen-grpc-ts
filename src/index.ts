/**
 * This is the ProtoC compiler plugin.
 *
 * It only accepts stdin/stdout output according to the protocol
 * specified in [plugin.proto](https://github.com/google/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto).
 *
 * source code copy from [ts-protoc-gen](https://github.com/improbable-eng/ts-protoc-gen/blob/master/src/index.ts)
 */
import {CodeGeneratorRequest, CodeGeneratorResponse} from 'google-protobuf/google/protobuf/compiler/plugin_pb';
import {FileDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';
import {Utility} from './lib/Utility';
import {EntryMap} from './lib/EntryMap';

import {FileDescriptorMSG} from './lib/descriptor/FileDescriptorMSG';
import {FileDescriptorGRPC} from './lib/descriptor/FileDescriptorGRPC';

Utility.withAllStdIn((input: Buffer) => {
    const response = new CodeGeneratorResponse();
    try {
        const binary = new Uint8Array(input.length);
        binary.set(input);

        const request = CodeGeneratorRequest.deserializeBinary(binary);
        if (request.getFileToGenerateList().length === 0 && request.getProtoFileList().length === 0) {
            throw new Error('Invalid CodeGeneratorRequest: no proto files and nothing to generate');
        }
        // protoc joins multiple --ts_out parameters with commas.
        const parameters = request.getParameter().split(',').map(p => p.trim());
        const isGrpcJs = parameters.indexOf('grpc_js') !== -1
            || parameters.indexOf('generate_package_definition') !== -1;

        // Declare support for proto3 optional fields so protoc will invoke
        // the plugin for protos that use them.
        response.setSupportedFeatures(CodeGeneratorResponse.Feature.FEATURE_PROTO3_OPTIONAL);

        // Parse request proto file
        const fileNameToDescriptor: { [key: string]: FileDescriptorProto } = {};
        const entryMap = new EntryMap();
        request.getProtoFileList().forEach((fileDescriptor) => {
            fileNameToDescriptor[fileDescriptor.getName()] = fileDescriptor;
            entryMap.parseFileDescriptor(fileDescriptor);
        });

        // Generate *_pb.d.ts && *_grpc_pb.d.ts
        request.getFileToGenerateList().forEach(fileName => {
            const outputFileName = Utility.filePathFromProtoWithoutExtension(fileName);
            const outputFile = new CodeGeneratorResponse.File();
            outputFile.setName(outputFileName + '.d.ts');
            outputFile.setContent(FileDescriptorMSG.print(fileNameToDescriptor[fileName], entryMap));
            response.addFile(outputFile);

            const fileDescriptorOutput = FileDescriptorGRPC.print(fileNameToDescriptor[fileName], entryMap, isGrpcJs);
            if (fileDescriptorOutput !== '') {
                const thisServiceFileName = Utility.svcFilePathFromProtoWithoutExtension(fileName);
                const thisServiceFile = new CodeGeneratorResponse.File();
                thisServiceFile.setName(thisServiceFileName + '.d.ts');
                thisServiceFile.setContent(fileDescriptorOutput);
                response.addFile(thisServiceFile);
            }
        });
    } catch (err) {
        // Report failures through the response so protoc can surface them
        // to the user, instead of dying with a non-zero exit code.
        response.setError(err && err.stack ? err.stack : String(err));
    }

    process.stdout.write(Buffer.from(response.serializeBinary()));
});
