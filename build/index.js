"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is the ProtoC compiler plugin.
 *
 * It only accepts stdin/stdout output according to the protocol
 * specified in [plugin.proto](https://github.com/google/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto).
 */
const plugin_pb_1 = require("google-protobuf/google/protobuf/compiler/plugin_pb");
const ExportMap_1 = require("./lib/ExportMap");
const Utility_1 = require("./lib/Utility");
const FileDescriptorTSD_1 = require("./lib/descriptor/FileDescriptorTSD");
const FileDescriptorTSServices_1 = require("./lib/descriptor/FileDescriptorTSServices");
Utility_1.Utility.withAllStdIn((inputBuff) => {
    try {
        const typedInputBuff = new Uint8Array(inputBuff.length);
        typedInputBuff.set(inputBuff);
        const codeGenRequest = plugin_pb_1.CodeGeneratorRequest.deserializeBinary(typedInputBuff);
        const codeGenResponse = new plugin_pb_1.CodeGeneratorResponse();
        const exportMap = new ExportMap_1.ExportMap();
        const fileNameToDescriptor = {};
        // Generate separate `.ts` files for services if param is set
        const generateServices = codeGenRequest.getParameter() === 'service=true';
        codeGenRequest.getProtoFileList().forEach(protoFileDescriptor => {
            fileNameToDescriptor[protoFileDescriptor.getName()] = protoFileDescriptor;
            exportMap.addFileDescriptor(protoFileDescriptor);
        });
        codeGenRequest.getFileToGenerateList().forEach(fileName => {
            const outputFileName = Utility_1.Utility.filePathFromProtoWithoutExtension(fileName);
            const thisFile = new plugin_pb_1.CodeGeneratorResponse.File();
            thisFile.setName(outputFileName + '.d.ts');
            thisFile.setContent(FileDescriptorTSD_1.FileDescriptorTSD.print(fileNameToDescriptor[fileName], exportMap));
            codeGenResponse.addFile(thisFile);
            if (generateServices) {
                const fileDescriptorOutput = FileDescriptorTSServices_1.FileDescriptorTSServices.print(fileNameToDescriptor[fileName], exportMap);
                if (fileDescriptorOutput !== '') {
                    const thisServiceFileName = Utility_1.Utility.svcFilePathFromProtoWithoutExtension(fileName);
                    const thisServiceFile = new plugin_pb_1.CodeGeneratorResponse.File();
                    thisServiceFile.setName(thisServiceFileName + '.d.ts');
                    thisServiceFile.setContent(fileDescriptorOutput);
                    codeGenResponse.addFile(thisServiceFile);
                }
            }
        });
        process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
    }
    catch (err) {
        console.error('protoc-gen-ts error: ' + err.stack + '\n');
        process.exit(1);
    }
});
