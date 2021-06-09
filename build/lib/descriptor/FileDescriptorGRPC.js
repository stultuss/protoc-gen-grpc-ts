"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDescriptorGRPC = void 0;
const Utility_1 = require("../Utility");
const Printer_1 = require("../Printer");
const DependencyTypesMap_1 = require("../DependencyTypesMap");
const DependencyFilter_1 = require("../DependencyFilter");
const FieldTypes_1 = require("./partial/FieldTypes");
var FileDescriptorGRPC;
(function (FileDescriptorGRPC) {
    FileDescriptorGRPC.defaultServiceType = JSON.stringify({
        serviceName: '',
        methods: [],
    });
    FileDescriptorGRPC.defaultServiceMethodType = JSON.stringify({
        packageName: '',
        serviceName: '',
        methodName: '',
        requestStream: false,
        responseStream: false,
        requestTypeName: '',
        responseTypeName: '',
        type: 'ClientUnaryCall',
    });
    function print(fileDescriptor, entryMap, isGrpcJs) {
        if (fileDescriptor.getServiceList().length === 0) {
            return '';
        }
        const fileName = fileDescriptor.getName();
        const packageName = fileDescriptor.getPackage();
        const upToRoot = Utility_1.Utility.getPathToRoot(fileName);
        const printer = new Printer_1.Printer(0);
        printer.printLn(`// package: ${packageName}`);
        printer.printLn(`// file: ${fileDescriptor.getName()}`);
        printer.printEmptyLn();
        // Need to import the non-service file that was generated for this .proto file
        if (isGrpcJs) {
            printer.printLn(`import * as grpc from '@grpc/grpc-js';`);
        }
        else {
            printer.printLn(`import * as grpc from 'grpc';`);
        }
        const asPseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(fileName);
        printer.printLn(`import * as ${asPseudoNamespace} from '${upToRoot}${Utility_1.Utility.filePathFromProtoWithoutExtension(fileName)}';`);
        fileDescriptor.getDependencyList().forEach((dependency) => {
            if (DependencyFilter_1.DependencyFilter.indexOf(dependency) !== -1) {
                return; // filtered
            }
            const pseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(dependency);
            if (dependency in DependencyTypesMap_1.DependencyTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${DependencyTypesMap_1.DependencyTypesMap[dependency]}';`);
            }
            else {
                const filePath = Utility_1.Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot + filePath}';`);
            }
        });
        printer.printEmptyLn();
        fileDescriptor.getServiceList().forEach((service) => {
            let serviceData = JSON.parse(FileDescriptorGRPC.defaultServiceType);
            serviceData.serviceName = service.getName();
            service.getMethodList().forEach((method) => {
                let methodData = JSON.parse(FileDescriptorGRPC.defaultServiceMethodType);
                methodData.packageName = packageName;
                methodData.serviceName = serviceData.serviceName;
                methodData.methodName = method.getName();
                methodData.requestStream = method.getClientStreaming();
                methodData.responseStream = method.getServerStreaming();
                methodData.requestTypeName = FieldTypes_1.FieldTypes.getFieldType(FieldTypes_1.MESSAGE_TYPE, method.getInputType().slice(1), '', entryMap);
                methodData.responseTypeName = FieldTypes_1.FieldTypes.getFieldType(FieldTypes_1.MESSAGE_TYPE, method.getOutputType().slice(1), '', entryMap);
                if (!method.getClientStreaming() && !method.getServerStreaming()) {
                    methodData.type = 'ClientUnaryCall';
                }
                else if (method.getClientStreaming() && !method.getServerStreaming()) {
                    methodData.type = 'ClientWritableStream';
                }
                else if (!method.getClientStreaming() && method.getServerStreaming()) {
                    methodData.type = 'ClientReadableStream';
                }
                else if (method.getClientStreaming() && method.getServerStreaming()) {
                    methodData.type = 'ClientDuplexStream';
                }
                serviceData.methods.push(methodData);
            });
            // print service interface
            printer.printLn(`interface I${serviceData.serviceName}Service extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {`);
            serviceData.methods.forEach(methodData => {
                printer.printIndentedLn(`${Utility_1.Utility.lcFirst(methodData.methodName)}: I${serviceData.serviceName}Service_I${methodData.methodName};`);
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
            // print method interface
            serviceData.methods.forEach(methodData => {
                printer.printLn(`interface I${serviceData.serviceName}Service_I${methodData.methodName} extends grpc.MethodDefinition<${methodData.requestTypeName}, ${methodData.responseTypeName}> {`);
                printer.printIndentedLn(`path: '/${methodData.packageName}.${methodData.serviceName}/${methodData.methodName}'`);
                printer.printIndentedLn(`requestStream: ${methodData.requestStream}`);
                printer.printIndentedLn(`responseStream: ${methodData.responseStream}`);
                printer.printIndentedLn(`requestSerialize: grpc.serialize<${methodData.requestTypeName}>;`);
                printer.printIndentedLn(`requestDeserialize: grpc.deserialize<${methodData.requestTypeName}>;`);
                printer.printIndentedLn(`responseSerialize: grpc.serialize<${methodData.responseTypeName}>;`);
                printer.printIndentedLn(`responseDeserialize: grpc.deserialize<${methodData.responseTypeName}>;`);
                printer.printLn(`}`);
                printer.printEmptyLn();
            });
            printer.printLn(`export const ${serviceData.serviceName}Service: I${serviceData.serviceName}Service;`);
            // print server interface
            printer.printLn(`export interface I${serviceData.serviceName}Server extends grpc.UntypedServiceImplementation {`);
            serviceData.methods.forEach((methodData) => {
                const methodName = Utility_1.Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;
                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`${methodName}: grpc.handleUnaryCall<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`${methodName}: grpc.handleClientStreamingCall<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`${methodName}: grpc.handleServerStreamingCall<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`${methodName}: grpc.handleBidiStreamingCall<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
            // print service client interface
            printer.printLn(`export interface I${serviceData.serviceName}Client {`);
            serviceData.methods.forEach(methodData => {
                const methodName = Utility_1.Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;
                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<${responseTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`${methodName}(callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`${methodName}(): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
            // print service client
            printer.printLn(`export class ${serviceData.serviceName}Client extends grpc.Client implements I${serviceData.serviceName}Client {`);
            printer.printIndentedLn(`constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);`);
            serviceData.methods.forEach(methodData => {
                const methodName = Utility_1.Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;
                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<${responseTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`public ${methodName}(callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${requestTypeName}>;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`public ${methodName}(): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
        });
        return printer.getOutput();
    }
    FileDescriptorGRPC.print = print;
})(FileDescriptorGRPC = exports.FileDescriptorGRPC || (exports.FileDescriptorGRPC = {}));
