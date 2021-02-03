// package: users
// file: users.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as users_pb from "./users_pb";

interface IUsersService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    createUser: IUsersService_ICreateUser;
    getUsers: IUsersService_IGetUsers;
    getUser: IUsersService_IGetUser;
    deleteUser: IUsersService_IDeleteUser;
    updateUser: IUsersService_IUpdateUser;
    getNewUsers: IUsersService_IGetNewUsers;
    createNewUser: IUsersService_ICreateNewUser;
}

interface IUsersService_ICreateUser extends grpc.MethodDefinition<users_pb.User, users_pb.Empty> {
    path: "/users.Users/CreateUser";
    requestStream: true;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.User>;
    requestDeserialize: grpc.deserialize<users_pb.User>;
    responseSerialize: grpc.serialize<users_pb.Empty>;
    responseDeserialize: grpc.deserialize<users_pb.Empty>;
}
interface IUsersService_IGetUsers extends grpc.MethodDefinition<users_pb.Empty, users_pb.User> {
    path: "/users.Users/GetUsers";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<users_pb.Empty>;
    requestDeserialize: grpc.deserialize<users_pb.Empty>;
    responseSerialize: grpc.serialize<users_pb.User>;
    responseDeserialize: grpc.deserialize<users_pb.User>;
}
interface IUsersService_IGetUser extends grpc.MethodDefinition<users_pb.UserId, users_pb.User> {
    path: "/users.Users/GetUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.UserId>;
    requestDeserialize: grpc.deserialize<users_pb.UserId>;
    responseSerialize: grpc.serialize<users_pb.User>;
    responseDeserialize: grpc.deserialize<users_pb.User>;
}
interface IUsersService_IDeleteUser extends grpc.MethodDefinition<users_pb.UserId, users_pb.UserList> {
    path: "/users.Users/DeleteUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.UserId>;
    requestDeserialize: grpc.deserialize<users_pb.UserId>;
    responseSerialize: grpc.serialize<users_pb.UserList>;
    responseDeserialize: grpc.deserialize<users_pb.UserList>;
}
interface IUsersService_IUpdateUser extends grpc.MethodDefinition<users_pb.User, users_pb.User> {
    path: "/users.Users/UpdateUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.User>;
    requestDeserialize: grpc.deserialize<users_pb.User>;
    responseSerialize: grpc.serialize<users_pb.User>;
    responseDeserialize: grpc.deserialize<users_pb.User>;
}
interface IUsersService_IGetNewUsers extends grpc.MethodDefinition<users_pb.Empty, users_pb.UserList> {
    path: "/users.Users/GetNewUsers";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.Empty>;
    requestDeserialize: grpc.deserialize<users_pb.Empty>;
    responseSerialize: grpc.serialize<users_pb.UserList>;
    responseDeserialize: grpc.deserialize<users_pb.UserList>;
}
interface IUsersService_ICreateNewUser extends grpc.MethodDefinition<users_pb.User, users_pb.User> {
    path: "/users.Users/CreateNewUser";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<users_pb.User>;
    requestDeserialize: grpc.deserialize<users_pb.User>;
    responseSerialize: grpc.serialize<users_pb.User>;
    responseDeserialize: grpc.deserialize<users_pb.User>;
}

export const UsersService: IUsersService;

export interface IUsersServer {
    createUser: grpc.handleClientStreamingCall<users_pb.User, users_pb.Empty>;
    getUsers: grpc.handleServerStreamingCall<users_pb.Empty, users_pb.User>;
    getUser: grpc.handleUnaryCall<users_pb.UserId, users_pb.User>;
    deleteUser: grpc.handleUnaryCall<users_pb.UserId, users_pb.UserList>;
    updateUser: grpc.handleUnaryCall<users_pb.User, users_pb.User>;
    getNewUsers: grpc.handleUnaryCall<users_pb.Empty, users_pb.UserList>;
    createNewUser: grpc.handleUnaryCall<users_pb.User, users_pb.User>;
}

export interface IUsersClient {
    createUser(callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    createUser(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    createUser(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    createUser(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    getUsers(request: users_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<users_pb.User>;
    getUsers(request: users_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<users_pb.User>;
    getUser(request: users_pb.UserId, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    getUser(request: users_pb.UserId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    getUser(request: users_pb.UserId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    deleteUser(request: users_pb.UserId, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    deleteUser(request: users_pb.UserId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    deleteUser(request: users_pb.UserId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    updateUser(request: users_pb.User, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    updateUser(request: users_pb.User, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    updateUser(request: users_pb.User, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    getNewUsers(request: users_pb.Empty, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    getNewUsers(request: users_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    getNewUsers(request: users_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    createNewUser(request: users_pb.User, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    createNewUser(request: users_pb.User, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    createNewUser(request: users_pb.User, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
}

export class UsersClient extends grpc.Client implements IUsersClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public createUser(callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    public createUser(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    public createUser(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    public createUser(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.Empty) => void): grpc.ClientWritableStream<users_pb.User>;
    public getUsers(request: users_pb.Empty, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<users_pb.User>;
    public getUsers(request: users_pb.Empty, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<users_pb.User>;
    public getUser(request: users_pb.UserId, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public getUser(request: users_pb.UserId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public getUser(request: users_pb.UserId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public deleteUser(request: users_pb.UserId, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public deleteUser(request: users_pb.UserId, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public deleteUser(request: users_pb.UserId, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public updateUser(request: users_pb.User, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public updateUser(request: users_pb.User, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public updateUser(request: users_pb.User, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public getNewUsers(request: users_pb.Empty, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public getNewUsers(request: users_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public getNewUsers(request: users_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.UserList) => void): grpc.ClientUnaryCall;
    public createNewUser(request: users_pb.User, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public createNewUser(request: users_pb.User, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
    public createNewUser(request: users_pb.User, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: users_pb.User) => void): grpc.ClientUnaryCall;
}
