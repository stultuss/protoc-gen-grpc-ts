protoc-gen-grpc
=========================
Protocol Buffers Compiler (protoc) plugin for generating grpc interfaces in TypeScript. Edit
Add topics


## Install
```bash
$ npm install protoc-gen-grpc -g
```

本工具的命令行工具只是将命令行 `protoc --plugins`进行封装，解决在 windows 下运行报错`%1 not a valid win32 application`的问题，并统一了在 linux 和 windows 下的运行命令。

## How to use

```bash

# generate js codes
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:./examples/src \
--grpc_out=./examples/src \
--proto_path ./examples/proto \
./examples/proto/book.proto

# generate d.ts codes
protoc-gen-grpc-ts \
--ts_out=service=true:./examples/src \
--proto_path ./examples/proto \
./examples/proto/book.proto
```