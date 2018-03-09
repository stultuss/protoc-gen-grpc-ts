"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utility_1 = require("../Utility");
const Printer_1 = require("../Printer");
const WellKnown_1 = require("../WellKnown");
const DependencyFilter_1 = require("../DependencyFilter");
const FieldTypes_1 = require("./partial/FieldTypes");
var FileDescriptorTSServices;
(function (FileDescriptorTSServices) {
    FileDescriptorTSServices.defaultServiceType = JSON.stringify({
        serviceName: '',
        methods: [],
    });
    FileDescriptorTSServices.defaultServiceMethodType = JSON.stringify({
        packageName: '',
        serviceName: '',
        methodName: '',
        requestStream: false,
        responseStream: false,
        requestTypeName: '',
        responseTypeName: '',
        type: 'ClientUnaryCall',
    });
    function print(fileDescriptor, exportMap) {
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
        printer.printLn(`import * as grpc from 'grpc';`);
        const asPseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(fileName);
        printer.printLn(`import * as ${asPseudoNamespace} from '${upToRoot}${Utility_1.Utility.filePathFromProtoWithoutExtension(fileName)}';`);
        fileDescriptor.getDependencyList().forEach((dependency) => {
            if (DependencyFilter_1.DependencyFilter.indexOf(dependency) !== -1) {
                return; // filtered
            }
            const pseudoNamespace = Utility_1.Utility.filePathToPseudoNamespace(dependency);
            if (dependency in WellKnown_1.WellKnownTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${WellKnown_1.WellKnownTypesMap[dependency]}';`);
            }
            else {
                const filePath = Utility_1.Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot + filePath}';`);
            }
        });
        printer.printEmptyLn();
        fileDescriptor.getServiceList().forEach(service => {
            let serviceData = JSON.parse(FileDescriptorTSServices.defaultServiceType);
            serviceData.serviceName = service.getName();
            service.getMethodList().forEach(method => {
                let methodData = JSON.parse(FileDescriptorTSServices.defaultServiceMethodType);
                methodData.packageName = packageName;
                methodData.serviceName = serviceData.serviceName;
                methodData.methodName = method.getName();
                methodData.requestStream = method.getClientStreaming();
                methodData.responseStream = method.getServerStreaming();
                methodData.requestTypeName = FieldTypes_1.FieldTypes.getFieldType(FieldTypes_1.MESSAGE_TYPE, method.getInputType().slice(1), '', exportMap);
                methodData.responseTypeName = FieldTypes_1.FieldTypes.getFieldType(FieldTypes_1.MESSAGE_TYPE, method.getOutputType().slice(1), '', exportMap);
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
                printer.printIndentedLn(`${Utility_1.Utility.lcFirst(methodData.methodName)}: I${methodData.methodName}`);
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
            // print method interface
            serviceData.methods.forEach(methodData => {
                printer.printLn(`interface I${methodData.methodName} {`);
                printer.printIndentedLn(`path: string; // "/${methodData.packageName}.${methodData.serviceName}/${methodData.methodName}"`);
                printer.printIndentedLn(`requestStream: boolean; // ${methodData.requestStream}`);
                printer.printIndentedLn(`responseStream: boolean; // ${methodData.responseStream}`);
                printer.printIndentedLn(`requestType: ${methodData.requestTypeName};`);
                printer.printIndentedLn(`responseType: ${methodData.responseTypeName};`);
                printer.printIndentedLn(`requestSerialize: (arg: ${methodData.requestTypeName}) => Buffer;`);
                printer.printIndentedLn(`requestDeserialize: (buffer: Uint8Array) => ${methodData.requestTypeName};`);
                printer.printIndentedLn(`responseSerialize: (arg: ${methodData.responseTypeName}) => Buffer;`);
                printer.printIndentedLn(`responseDeserialize: (buffer: Uint8Array) => ${methodData.responseTypeName};`);
                printer.printLn(`}`);
                printer.printEmptyLn();
            });
            // print service client interface
            printer.printLn(`export interface I${serviceData.serviceName}Client {`);
            serviceData.methods.forEach(methodData => {
                const methodName = Utility_1.Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;
                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`${methodName}(callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${responseTypeName}>;`);
                        printer.printIndentedLn(`${methodName}(metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata): grpc.ClientReadableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`${methodName}(metadata?: grpc.Metadata): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
            // print service client
            printer.printLn(`export const ${serviceData.serviceName}Service: I${serviceData.serviceName}Service;`);
            printer.printLn(`export class ${serviceData.serviceName}Client extends grpc.Client implements I${serviceData.serviceName}Client {`);
            printer.printIndentedLn(`constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);`);
            serviceData.methods.forEach(methodData => {
                const methodName = Utility_1.Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;
                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`public ${methodName}(callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${responseTypeName}>;`);
                        printer.printIndentedLn(`public ${methodName}(metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata): grpc.ClientReadableStream<${responseTypeName}>;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`public ${methodName}(metadata?: grpc.Metadata): grpc.ClientDuplexStream<${requestTypeName}, ${responseTypeName}>;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();
        });
        return printer.getOutput();
    }
    FileDescriptorTSServices.print = print;
})(FileDescriptorTSServices = exports.FileDescriptorTSServices || (exports.FileDescriptorTSServices = {}));
