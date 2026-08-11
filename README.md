protoc-gen-grpc
=========================
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![CI](https://github.com/stultuss/protoc-gen-grpc-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/stultuss/protoc-gen-grpc-ts/actions/workflows/ci.yml)

> An all-in-one `protoc` toolchain for gRPC in TypeScript. It bundles `protoc`
> and the gRPC plugin, so a single global install works in every project.

## Why protoc-gen-grpc?

### 🛡️ Non-invasive & fully isolated from your project

A **global tool** that never touches your project code — nothing is added to
your project's `package.json` or `node_modules`, and the generator lives
**completely outside** your project tree. Your project stays exactly as it was.

- **Non-invasive**: never touches project code, `package.json` or
  `node_modules` — fully isolated from your project tree.
- **Zero setup**: install once globally and run `protoc-gen-grpc` /
  `protoc-gen-grpc-ts` from any project. No need to install `protoc` or
  `grpc-tools` separately.
- **All-in-one**: generates both JavaScript (`*_pb.js`, `*_grpc_pb.js`) and
  TypeScript declarations (`*_pb.d.ts`, `*_grpc_pb.d.ts`) from your `.proto`
  files.
- **Small footprint**: the published npm package is only ~14 kB; the
  `protoc`/`grpc_node_plugin` binaries are fetched once at install time.
- **Modern**: `@grpc/grpc-js` output, proto3 `optional` fields, and `oneof`
  groups.
- **Tested**: 90+ unit tests with golden output baselines, run automatically
  on GitHub Actions for Node.js 20 and 22.

## Install

```bash
npm install protoc-gen-grpc -g
```

It also works as a project-local dev dependency, e.g. for reproducible CI
builds:

```bash
npm install protoc-gen-grpc --save-dev
# then use the binaries under ./node_modules/.bin
```

## Binary downloads

During `npm install`, the package downloads the `protoc` and `grpc_node_plugin`
binaries from `node-precompiled-binaries.grpc.io` (grpc-tools v1.13.0, bundling
protoc 3.19.1). Every download is verified against a pinned sha512 checksum
before extraction; a mismatch aborts the install. If that host is unreachable
in your environment, point the installer at a mirror:

```bash
export npm_config_grpc_tools_binary_host_mirror=https://your-mirror.example.com/
npm install protoc-gen-grpc -g
```

> Known limitation: grpc-tools has not published a newer release, so the
> bundled protoc stays at 3.19.1 and does not support proto editions.

## Compatibility

- Generates TypeScript declarations for JavaScript produced by
  `google-protobuf` (jspb) 3.x; the generated code imports `@grpc/grpc-js`,
  which your project must install itself.
- Bundled toolchain is grpc-tools v1.13.0 (protoc 3.19.1 + grpc_node_plugin,
  2021-era): proto2 and proto3 are supported, proto editions are not.
- Requires Node.js >= 18.
- Bundled binaries are linux-x64, darwin-x64 and win32-x64 only: Apple Silicon
  users need Rosetta 2, and arm64 Linux is not provided.
- `npm run test:differential` regenerates the corpus with the real bundled
  protoc and verifies the emitted `.d.ts` matches the runtime JS surface
  (methods, enums, extensions, service paths). It needs the bundled binaries,
  so it is not part of CI; run it locally after generator changes.

## How to use

**Supported features**

- Generates TypeScript declarations for `@grpc/grpc-js` — the only supported
  runtime (the legacy `grpc` package is no longer maintained). `--ts_out`
  parameters such as `grpc_js` are accepted for compatibility and ignored;
  your project must install `@grpc/grpc-js` to compile the generated code.
- Supports `oneof` groups with a `get<Name>Case()` accessor and a `<Name>Case`
  enum.
- Supports proto3 `optional` fields.
- Supports `[jstype = JS_STRING]` fields, mapping `int64`/`uint64` to `string`
  to avoid precision loss.
- Occupied field names such as `extension` get a `$` suffix (`getExtension$()`),
  matching the generated JavaScript.

**Example**

Please try ./examples/build.sh

**Support**

bash

```bash
# generate js codes with @grpc/grpc-js
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:${OUTPUT_DEST} \
--grpc_out=grpc_js:./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/product.proto

# generate d.ts codes with @grpc/grpc-js
protoc-gen-grpc-ts \
--ts_out=./examples/src/proto \
--proto_path ./examples/proto \
./examples/proto/product.proto
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

## Example

There is a complete & runnable example in folder `examples`.

```bash
## bash1
cd ./examples
npm install
sh ./build.sh       # build js & d.ts codes from proto file, and tsc to build/*.js
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
    optional string remark = 4;
    int64 big_id = 5 [jstype = JS_STRING];
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
    rpc CreateOrder (Order) returns (Order) {}
}

message Shop {
    string name = 1;
    map<int64, Product> list = 2;
}

message Order {
    oneof payment {
        int64 cash = 1;
        string card = 2;
    }
}

message ExtensionDemo {
    string extension = 1;
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
  createOrder: IProductServiceService_ICreateOrder;
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

interface IProductServiceService_ICreateOrder extends grpc.MethodDefinition<product_pb.Order, product_pb.Order> {
  path: '/com.product.ProductService/CreateOrder'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<product_pb.Order>;
  requestDeserialize: grpc.deserialize<product_pb.Order>;
  responseSerialize: grpc.serialize<product_pb.Order>;
  responseDeserialize: grpc.deserialize<product_pb.Order>;
}

export const ProductServiceService: IProductServiceService;
export interface IProductServiceServer extends grpc.UntypedServiceImplementation {
  getProduct: grpc.handleUnaryCall<product_pb.GetProductRequest, product_pb.Product>;
  getProductViaCategory: grpc.handleServerStreamingCall<product_pb.GetProductViaCategoryRequest, product_pb.Product>;
  getBestProduct: grpc.handleClientStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
  getProducts: grpc.handleBidiStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
  createOrder: grpc.handleUnaryCall<product_pb.Order, product_pb.Order>;
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
  createOrder(request: product_pb.Order, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
  createOrder(request: product_pb.Order, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
  createOrder(request: product_pb.Order, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
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
  public createOrder(request: product_pb.Order, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
  public createOrder(request: product_pb.Order, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
  public createOrder(request: product_pb.Order, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Order) => void): grpc.ClientUnaryCall;
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

  hasRemark(): boolean;
  clearRemark(): void;
  getRemark(): string | undefined;
  setRemark(value: string): void;

  getBigId(): string;
  setBigId(value: string): void;

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
    remark?: string,
    bigId: string,
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

export class Order extends jspb.Message {
  hasCash(): boolean;
  clearCash(): void;
  getCash(): number;
  setCash(value: number): void;

  hasCard(): boolean;
  clearCard(): void;
  getCard(): string;
  setCard(value: string): void;

  getPaymentCase(): Order.PaymentCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Order.AsObject;
  static toObject(includeInstance: boolean, msg: Order): Order.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Order, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Order;
  static deserializeBinaryFromReader(message: Order, reader: jspb.BinaryReader): Order;
}

export namespace Order {
  export type AsObject = {
    cash: number,
    card: string,
  }

  export enum PaymentCase {
    PAYMENT_NOT_SET = 0,
    CASH = 1,
    CARD = 2,
  }
}

export class ExtensionDemo extends jspb.Message {
  getExtension$(): string;
  setExtension$(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtensionDemo.AsObject;
  static toObject(includeInstance: boolean, msg: ExtensionDemo): ExtensionDemo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtensionDemo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtensionDemo;
  static deserializeBinaryFromReader(message: ExtensionDemo, reader: jspb.BinaryReader): ExtensionDemo;
}

export namespace ExtensionDemo {
  export type AsObject = {
    extension: string,
  }
}

```

## License

[MIT](LICENSE)

## Testing

```bash
npm test
```

The test suite covers every generator module and compares generated output
against golden baselines in `test/golden`. After an intentional output change,
regenerate the baselines with `npm run test:update-golden` and review the diff.

## CI

Tests also run automatically on GitHub Actions (see `.github/workflows/ci.yml`)
for every push and pull request, on Node.js 20 and 22. The workflow installs
dependencies with `npm ci --ignore-scripts`, because the unit tests run the
compiled plugin directly and do not need the grpc-tools binaries.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

[npm-image]: https://img.shields.io/npm/v/protoc-gen-grpc.svg
[npm-url]: https://npmjs.org/package/protoc-gen-grpc
[downloads-image]: https://img.shields.io/npm/dm/protoc-gen-grpc.svg
[downloads-url]: https://npmjs.org/package/protoc-gen-grpc
