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
    try {
        const binary = new Uint8Array(input.length);
        binary.set(input);
        
        const request = CodeGeneratorRequest.deserializeBinary(binary);
        const response = new CodeGeneratorResponse();
        const generateServices = (request.getParameter() === 'service=true');
        const isGrpcJs = ['generate_package_definition', 'grpc_js'].indexOf(request.getParameter()) !== -1;
        
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
        
        process.stdout.write(Buffer.from(response.serializeBinary()));
    } catch (err) {
        console.error('error: ' + err.stack + '\n');
        process.exit(1);
    }
});