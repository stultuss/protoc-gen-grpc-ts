import {FileDescriptorProto} from 'google-protobuf/google/protobuf/descriptor_pb';

import {ExportMap} from '../ExportMap';
import {Utility} from '../Utility';
import {Printer} from '../Printer';
import {WellKnownTypesMap} from '../WellKnown';
import {DependencyFilter} from '../DependencyFilter';

import {FieldTypes, MESSAGE_TYPE} from './partial/FieldTypes';

export namespace FileDescriptorTSServices {

    export interface ServiceType {
        serviceName: string;
        methods: Array<ServiceMethodType>;
    }

    export const defaultServiceType = JSON.stringify({
        serviceName: '',
        methods: [],
    } as ServiceType);

    export interface ServiceMethodType {
        packageName: string;
        serviceName: string;
        methodName: string;
        requestStream: boolean;
        responseStream: boolean;
        requestTypeName: string;
        responseTypeName: string;
        type: string; // 'ClientUnaryCall' || 'ClientWritableStream' || 'ClientReadableStream' || 'ClientDuplexStream'
    }

    export const defaultServiceMethodType = JSON.stringify({
        packageName: '',
        serviceName: '',
        methodName: '',
        requestStream: false,
        responseStream: false,
        requestTypeName: '',
        responseTypeName: '',
        type: 'ClientUnaryCall',
    } as ServiceMethodType);

    export function print(fileDescriptor: FileDescriptorProto, exportMap: ExportMap): string {
        if (fileDescriptor.getServiceList().length === 0) {
            return '';
        }

        const fileName = fileDescriptor.getName();
        const packageName = fileDescriptor.getPackage();
        const upToRoot = Utility.getPathToRoot(fileName);

        const printer = new Printer(0);
        printer.printLn(`// package: ${packageName}`);
        printer.printLn(`// file: ${fileDescriptor.getName()}`);
        printer.printEmptyLn();
        printer.printLn(`/* tslint:disable */`);
        printer.printEmptyLn();

        // Need to import the non-service file that was generated for this .proto file
        printer.printLn(`import * as grpc from 'grpc';`);
        const asPseudoNamespace = Utility.filePathToPseudoNamespace(fileName);
        printer.printLn(`import * as ${asPseudoNamespace} from '${upToRoot}${Utility.filePathFromProtoWithoutExtension(fileName)}';`);

        fileDescriptor.getDependencyList().forEach((dependency: string) => {
            if (DependencyFilter.indexOf(dependency) !== -1) {
                return; // filtered
            }
            const pseudoNamespace = Utility.filePathToPseudoNamespace(dependency);
            if (dependency in WellKnownTypesMap) {
                printer.printLn(`import * as ${pseudoNamespace} from '${WellKnownTypesMap[dependency]}';`);
            } else {
                const filePath = Utility.filePathFromProtoWithoutExtension(dependency);
                printer.printLn(`import * as ${pseudoNamespace} from '${upToRoot + filePath}';`);
            }
        });
        printer.printEmptyLn();

        fileDescriptor.getServiceList().forEach(service => {
            let serviceData = JSON.parse(defaultServiceType) as ServiceType;

            serviceData.serviceName = service.getName();

            service.getMethodList().forEach(method => {
                let methodData = JSON.parse(defaultServiceMethodType) as ServiceMethodType;
                methodData.packageName = packageName;
                methodData.serviceName = serviceData.serviceName;
                methodData.methodName = method.getName();
                methodData.requestStream = method.getClientStreaming();
                methodData.responseStream = method.getServerStreaming();
                methodData.requestTypeName = FieldTypes.getFieldType(MESSAGE_TYPE, method.getInputType().slice(1), '', exportMap);
                methodData.responseTypeName = FieldTypes.getFieldType(MESSAGE_TYPE, method.getOutputType().slice(1), '', exportMap);

                if (!method.getClientStreaming() && !method.getServerStreaming()) {
                    methodData.type = 'ClientUnaryCall';
                } else if (method.getClientStreaming() && !method.getServerStreaming()) {
                    methodData.type = 'ClientWritableStream';
                } else if (!method.getClientStreaming() && method.getServerStreaming()) {
                    methodData.type = 'ClientReadableStream';
                } else if (method.getClientStreaming() && method.getServerStreaming()) {
                    methodData.type = 'ClientDuplexStream';
                }

                serviceData.methods.push(methodData);
            });

            // print service interface
            printer.printLn(`interface I${serviceData.serviceName}Service extends grpc.ServiceDefinition {`);
            serviceData.methods.forEach(methodData => {
                printer.printIndentedLn(`${Utility.lcFirst(methodData.methodName)}: I${methodData.methodName}`);
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
                const methodName = Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;

                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`${methodName}(callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream;`);
                        printer.printIndentedLn(`${methodName}(callback: (error: Error | null, metadata: grpc.Metadata, response: ${responseTypeName}) => void): grpc.ClientWritableStream;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata): grpc.ClientReadableStream;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`${methodName}(metadata?: grpc.Metadata): grpc.ClientDuplexStream;`);
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
                const methodName = Utility.lcFirst(methodData.methodName);
                const requestTypeName = methodData.requestTypeName;
                const responseTypeName = methodData.responseTypeName;

                switch (methodData.type) {
                    case 'ClientUnaryCall':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata: grpc.Metadata, callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientUnaryCall;`);
                        break;
                    case 'ClientWritableStream':
                        printer.printIndentedLn(`public ${methodName}(callback: (error: Error | null, response: ${responseTypeName}) => void): grpc.ClientWritableStream;`);
                        printer.printIndentedLn(`public ${methodName}(callback: (error: Error | null, metadata: grpc.Metadata, response: ${responseTypeName}) => void): grpc.ClientWritableStream;`);
                        break;
                    case 'ClientReadableStream':
                        printer.printIndentedLn(`public ${methodName}(request: ${requestTypeName}, metadata?: grpc.Metadata): grpc.ClientReadableStream;`);
                        break;
                    case 'ClientDuplexStream':
                        printer.printIndentedLn(`public ${methodName}(metadata?: grpc.Metadata): grpc.ClientDuplexStream;`);
                        break;
                }
            });
            printer.printLn(`}`);
            printer.printEmptyLn();

        });

        return printer.getOutput();
    }
}


