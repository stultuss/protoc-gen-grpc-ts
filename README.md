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

> About Apple M1 arm64

```bash
npm_config_target_arch=x64 npm i grpc-tools
```

> About node-pre-gyp ERR! stack Error: There was a fatal problem while downloading/extracting the tarball

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

**Support - grpc-js**

bash

```bash
# generate js codes with @grpc/grpc-js
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:${OUTPUT_DEST} \
--grpc_out=grpc_js:./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/student.proto

# generate d.ts codes with @grpc/grpc-js
protoc-gen-grpc-ts \
--ts_out=grpc_js:./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/student.proto
```
server.ts

```javascript
// support grpc-js
import * as grpc from '@grpc/grpc-js';
...
...
const server = new grpc.Server();
server.addService(ProductServiceService, ServerImpl);
```

**Support - grpc**

bash

```bash
# generate js codes with grpc
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:./examples/src/proto \
--grpc_out=./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/student.proto

# generate d.ts codes with grpc
protoc-gen-grpc-ts \
--ts_out=./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/student.proto
```

server.ts

```javascript
// support grpc-js
import * as grpc from 'grpc';
...
...
const server = new grpc.Server();
server.addService(ProductServiceService, new ServerImpl());
```

## Example

There is a complete & runnable example in folder `examples`.

```bash
## bash1
cd ./examples
npm install
sh ./bash/build.sh  # build js & d.ts codes from proto file, and tsc to build/*.js
sh ./bash/server.sh # start the grpc server

## bash2
cd ./examples
npm install
sh ./bash/client.sh # start the grpc client & send requests
```

### product.proto
```proto
syntax = "proto3";

package com.product;

message Product {
    int64 id = 1;
    string name = 2;
    string category = 3;
}

message GetProductRequest {
    int64 id = 1;
}

message GetProductViaCategoryRequest {
    string category = 1;
}

service ProductService {
    rpc GetProduct (GetProductRequest) returns (Product) {}
    rpc GetProductViaCategory (GetProductViaCategoryRequest) returns (stream Product) {}
    rpc GetBestProduct (stream GetProductRequest) returns (Product) {}
    rpc GetProducts (stream GetProductRequest) returns (stream Product) {}
}

message Shop {
    string name = 1;
    map<int64, Product> list = 2;
}
```

### product_grpc_pb.d.ts
```typescript
// package: com.product
// file: product.proto

import * as grpc from '@grpc/grpc-js';
import * as product_pb from './product_pb';

interface IProductServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getProduct: IProductServiceService_IGetProduct;
  getProductViaCategory: IProductServiceService_IGetProductViaCategory;
  getBestProduct: IProductServiceService_IGetBestProduct;
  getProducts: IProductServiceService_IGetProducts;
}

interface IProductServiceService_IGetProduct extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetProductViaCategory extends grpc.MethodDefinition<product_pb.GetProductViaCategoryRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProductViaCategory'
  requestStream: false
  responseStream: true
  requestSerialize: grpc.serialize<product_pb.GetProductViaCategoryRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductViaCategoryRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetBestProduct extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetBestProduct'
  requestStream: true
  responseStream: false
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetProducts extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProducts'
  requestStream: true
  responseStream: true
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

export const ProductServiceService: IProductServiceService;
export interface IProductServiceServer extends grpc.UntypedServiceImplementation {
  getProduct: grpc.handleUnaryCall<product_pb.GetProductRequest, product_pb.Product>;
  getProductViaCategory: grpc.handleServerStreamingCall<product_pb.GetProductViaCategoryRequest, product_pb.Product>;
  getBestProduct: grpc.handleClientStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
  getProducts: grpc.handleBidiStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
}

export interface IProductServiceClient {
  getProduct(request: product_pb.GetProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  getBestProduct(callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getProducts(): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  getProducts(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  getProducts(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
}

export class ProductServiceClient extends grpc.Client implements IProductServiceClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
  public getProduct(request: product_pb.GetProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  public getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  public getBestProduct(callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getProducts(): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  public getProducts(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  public getProducts(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
}
```

### product_pb.d.ts
```typescript
// package: com.product
// file: product.proto

import * as jspb from 'google-protobuf';

export class Product extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getCategory(): string;
  setCategory(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Product.AsObject;
  static toObject(includeInstance: boolean, msg: Product): Product.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Product, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Product;
  static deserializeBinaryFromReader(message: Product, reader: jspb.BinaryReader): Product;
}

export namespace Product {
  export type AsObject = {
    id: number,
    name: string,
    category: string,
  }
}

export class GetProductRequest extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProductRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProductRequest): GetProductRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetProductRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProductRequest;
  static deserializeBinaryFromReader(message: GetProductRequest, reader: jspb.BinaryReader): GetProductRequest;
}

export namespace GetProductRequest {
  export type AsObject = {
    id: number,
  }
}

export class GetProductViaCategoryRequest extends jspb.Message {
  getCategory(): string;
  setCategory(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProductViaCategoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProductViaCategoryRequest): GetProductViaCategoryRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetProductViaCategoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProductViaCategoryRequest;
  static deserializeBinaryFromReader(message: GetProductViaCategoryRequest, reader: jspb.BinaryReader): GetProductViaCategoryRequest;
}

export namespace GetProductViaCategoryRequest {
  export type AsObject = {
    category: string,
  }
}

export class Shop extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getListMap(): jspb.Map<number, Product>;
  clearListMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Shop.AsObject;
  static toObject(includeInstance: boolean, msg: Shop): Shop.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Shop, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Shop;
  static deserializeBinaryFromReader(message: Shop, reader: jspb.BinaryReader): Shop;
}

export namespace Shop {
  export type AsObject = {
    name: string,
    listMap: Array<[number, Product.AsObject]>,
  }
}
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/protoc-gen-grpc.svg
[npm-url]: https://npmjs.org/package/protoc-gen-grpc
[downloads-image]: https://img.shields.io/npm/dm/protoc-gen-grpc.svg
[downloads-url]: https://npmjs.org/package/protoc-gen-grpc
[travis-image]: https://app.travis-ci.com/stultuss/protoc-gen-grpc-ts.svg?branch=master
[travis-url]: https://app.travis-ci.com/stultuss/protoc-gen-grpc-ts
[travis-linux-image]: https://img.shields.io/travis/stultuss/protoc-gen-grpc-ts/master.svg?label=linux
[travis-linux-url]: https://app.travis-ci.org/stultuss/protoc-gen-grpc-ts
[travis-windows-image]: https://img.shields.io/travis/stultuss/protoc-gen-grpc-ts/master.svg?label=windows
[travis-windows-url]: https://app.travis-ci.org/stultuss/protoc-gen-grpc-ts
[coveralls-image]: https://img.shields.io/coveralls/stultuss/protoc-gen-grpc-ts/master.svg
[coveralls-url]: https://coveralls.io/r/stultuss/protoc-gen-grpc-ts?branch=master
