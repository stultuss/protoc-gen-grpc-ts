protoc-gen-grpc
=========================
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build][travis-image]][travis-url]
[![Linux Build][travis-linux-image]][travis-linux-url]
[![Windows Build][travis-windows-image]][travis-windows-url]
[![Test Coverage][coveralls-image]][coveralls-url]

> Protocol compiler plugin for generating grpc interfaces in TypeScript.

## WARN 

> node-pre-gyp WARN Using needle for node-pre-gyp https download 
> node-pre-gyp ERR! install error 
> node-pre-gyp ERR! stack Error: There was a fatal problem while downloading/extracting the tarball

issue：https://github.com/mapbox/node-pre-gyp/issues/462

```bash
npm install request -g
```

## Install

```bash
npm config set unsafe-perm true
npm install protoc-gen-grpc -g
```
> If you don't want to set up a public configuration for NPM, you can try to add after the installation command `-unsafe-perm` parameters.

## How to use

```bash
# generate js codes
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:./examples/src/proto \
--grpc_out=./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/book.proto

# generate d.ts codes
protoc-gen-grpc-ts \
--ts_out=service=true:./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/book.proto
```
## Example

There is a complete & runnable example in folder `examples`.

```bash
## bash1
cd ./examples
sh ./bash/build.sh  # build js & d.ts codes from proto file, and tsc to build/*.js
sh ./bash/server.sh # start the grpc server

## bash2
cd ./examples
sh ./bash/client.sh # start the grpc client & send requests
```

### book.proto
```proto
syntax = "proto3";

package com.book;

message Book {
    int64 isbn = 1;
    string title = 2;
    string author = 3;
}

message GetBookRequest {
    int64 isbn = 1;
}

message GetBookViaAuthorRequest {
    string author = 1;
}

service BookService {
    rpc GetBook (GetBookRequest) returns (Book) {}
    rpc GetBooksViaAuthor (GetBookViaAuthorRequest) returns (stream Book) {}
    rpc GetGreatestBook (stream GetBookRequest) returns (Book) {}
    rpc GetBooks (stream GetBookRequest) returns (stream Book) {}
}

message BookStore {
    string name = 1;
    map<int64, string> books = 2;
}

enum EnumSample {
    option allow_alias = true;
    UNKNOWN = 0;
    STARTED = 1;
    RUNNING = 1;
}
```

### book_pb.d.ts
```typescript
// package: com.book
// file: book.proto

import * as jspb from 'google-protobuf';

export class Book extends jspb.Message {
  getIsbn(): number;
  setIsbn(value: number): void;

  getTitle(): string;
  setTitle(value: string): void;

  getAuthor(): string;
  setAuthor(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Book.AsObject;
  static toObject(includeInstance: boolean, msg: Book): Book.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Book, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Book;
  static deserializeBinaryFromReader(message: Book, reader: jspb.BinaryReader): Book;
}

export namespace Book {
  export type AsObject = {
    isbn: number,
    title: string,
    author: string,
  }
}

export class GetBookRequest extends jspb.Message {
  getIsbn(): number;
  setIsbn(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBookRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBookRequest): GetBookRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetBookRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBookRequest;
  static deserializeBinaryFromReader(message: GetBookRequest, reader: jspb.BinaryReader): GetBookRequest;
}

export namespace GetBookRequest {
  export type AsObject = {
    isbn: number,
  }
}

export class GetBookViaAuthorRequest extends jspb.Message {
  getAuthor(): string;
  setAuthor(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBookViaAuthorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBookViaAuthorRequest): GetBookViaAuthorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetBookViaAuthorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBookViaAuthorRequest;
  static deserializeBinaryFromReader(message: GetBookViaAuthorRequest, reader: jspb.BinaryReader): GetBookViaAuthorRequest;
}

export namespace GetBookViaAuthorRequest {
  export type AsObject = {
    author: string,
  }
}

export class BookStore extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getBooksMap(): jspb.Map<number, string>;
  clearBooksMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BookStore.AsObject;
  static toObject(includeInstance: boolean, msg: BookStore): BookStore.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BookStore, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BookStore;
  static deserializeBinaryFromReader(message: BookStore, reader: jspb.BinaryReader): BookStore;
}

export namespace BookStore {
  export type AsObject = {
    name: string,
    booksMap: Array<[number, string]>,
  }
}

export enum EnumSample {
  UNKNOWN = 0,
  STARTED = 1,
  RUNNING = 1,
}
```

### book_grpc_pb.d.ts
```typescript
// package: com.book
// file: book.proto

import * as grpc from 'grpc';
import * as book_pb from './book_pb';

interface IBookServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getBook: IBookServiceService_IGetBook;
  getBooksViaAuthor: IBookServiceService_IGetBooksViaAuthor;
  getGreatestBook: IBookServiceService_IGetGreatestBook;
  getBooks: IBookServiceService_IGetBooks;
}

interface IBookServiceService_IGetBook {
  path: string; // "/com.book.BookService/GetBook"
  requestStream: boolean; // false
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<book_pb.GetBookRequest>;
  requestDeserialize: grpc.deserialize<book_pb.GetBookRequest>;
  responseSerialize: grpc.serialize<book_pb.Book>;
  responseDeserialize: grpc.deserialize<book_pb.Book>;
}

interface IBookServiceService_IGetBooksViaAuthor {
  path: string; // "/com.book.BookService/GetBooksViaAuthor"
  requestStream: boolean; // false
  responseStream: boolean; // true
  requestSerialize: grpc.serialize<book_pb.GetBookViaAuthorRequest>;
  requestDeserialize: grpc.deserialize<book_pb.GetBookViaAuthorRequest>;
  responseSerialize: grpc.serialize<book_pb.Book>;
  responseDeserialize: grpc.deserialize<book_pb.Book>;
}

interface IBookServiceService_IGetGreatestBook {
  path: string; // "/com.book.BookService/GetGreatestBook"
  requestStream: boolean; // true
  responseStream: boolean; // false
  requestSerialize: grpc.serialize<book_pb.GetBookRequest>;
  requestDeserialize: grpc.deserialize<book_pb.GetBookRequest>;
  responseSerialize: grpc.serialize<book_pb.Book>;
  responseDeserialize: grpc.deserialize<book_pb.Book>;
}

interface IBookServiceService_IGetBooks {
  path: string; // "/com.book.BookService/GetBooks"
  requestStream: boolean; // true
  responseStream: boolean; // true
  requestSerialize: grpc.serialize<book_pb.GetBookRequest>;
  requestDeserialize: grpc.deserialize<book_pb.GetBookRequest>;
  responseSerialize: grpc.serialize<book_pb.Book>;
  responseDeserialize: grpc.deserialize<book_pb.Book>;
}

export const BookServiceService: IBookServiceService;
export interface IBookServiceServer {
  getBook: grpc.handleUnaryCall<book_pb.GetBookRequest, book_pb.Book>;
  getBooksViaAuthor: grpc.handleServerStreamingCall<book_pb.GetBookViaAuthorRequest, book_pb.Book>;
  getGreatestBook: grpc.handleClientStreamingCall<book_pb.GetBookRequest, book_pb.Book>;
  getBooks: grpc.handleBidiStreamingCall<book_pb.GetBookRequest, book_pb.Book>;
}

export interface IBookServiceClient {
  getBook(request: book_pb.GetBookRequest, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientUnaryCall;
  getBook(request: book_pb.GetBookRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientUnaryCall;
  getBooksViaAuthor(request: book_pb.GetBookViaAuthorRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<book_pb.Book>;
  getGreatestBook(callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientWritableStream<book_pb.Book>;
  getGreatestBook(metadata: grpc.Metadata, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientWritableStream<book_pb.Book>;
  getBooks(metadata?: grpc.Metadata): grpc.ClientDuplexStream<book_pb.GetBookRequest, book_pb.Book>;
}

export class BookServiceClient extends grpc.Client implements IBookServiceClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  public getBook(request: book_pb.GetBookRequest, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientUnaryCall;
  public getBook(request: book_pb.GetBookRequest, metadata: grpc.Metadata, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientUnaryCall;
  public getBooksViaAuthor(request: book_pb.GetBookViaAuthorRequest, metadata?: grpc.Metadata): grpc.ClientReadableStream<book_pb.Book>;
  public getGreatestBook(callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientWritableStream<book_pb.Book>;
  public getGreatestBook(metadata: grpc.Metadata, callback: (error: Error | null, response: book_pb.Book) => void): grpc.ClientWritableStream<book_pb.Book>;
  public getBooks(metadata?: grpc.Metadata): grpc.ClientDuplexStream<book_pb.GetBookRequest, book_pb.Book>;
}
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/protoc-gen-grpc.svg
[npm-url]: https://npmjs.org/package/protoc-gen-grpc
[downloads-image]: https://img.shields.io/npm/dm/protoc-gen-grpc.svg
[downloads-url]: https://npmjs.org/package/protoc-gen-grpc
[travis-image]: https://travis-ci.org/stultuss/protoc-gen-grpc-ts.svg?branch=master
[travis-url]: https://travis-ci.org/stultuss/protoc-gen-grpc-ts
[travis-linux-image]: https://img.shields.io/travis/stultuss/protoc-gen-grpc-ts/master.svg?label=linux
[travis-linux-url]: https://travis-ci.org/stultuss/protoc-gen-grpc-ts
[travis-windows-image]: https://img.shields.io/travis/stultuss/protoc-gen-grpc-ts/master.svg?label=windows
[travis-windows-url]: https://travis-ci.org/stultuss/protoc-gen-grpc-ts
[coveralls-image]: https://img.shields.io/coveralls/stultuss/protoc-gen-grpc-ts/master.svg
[coveralls-url]: https://coveralls.io/r/stultuss/protoc-gen-grpc-ts?branch=master
