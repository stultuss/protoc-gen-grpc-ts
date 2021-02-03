#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd ${BASEDIR}/../

PROTO_DEST=./src/proto

mkdir -p ${PROTO_DEST}

# JavaScript code generating
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:${PROTO_DEST} \
--grpc_out=${PROTO_DEST} \
--proto_path ./proto \
./proto/*.proto

protoc-gen-grpc-ts \
--ts_out=service=true:${PROTO_DEST} \
--proto_path ./proto \
./proto/*.proto

# TypeScript compiling
mkdir -p ./build/proto
cp -r ./src/proto/* ./build/proto
tsc