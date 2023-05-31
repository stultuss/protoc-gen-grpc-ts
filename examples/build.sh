#!/usr/bin/env bash

PROTO_DEST=./proto
OUTPUT_DEST=./src/proto
BUILD_DEST=./build/proto

mkdir -p ${OUTPUT_DEST}

# JavaScript code generating
protoc-gen-grpc \
--js_out=import_style=commonjs,binary:${OUTPUT_DEST} \
--grpc_out=grpc_js:${OUTPUT_DEST} \
--proto_path ${PROTO_DEST} \
${PROTO_DEST}/*.proto

protoc-gen-grpc-ts \
--ts_out=grpc_js:${OUTPUT_DEST} \
--proto_path ${PROTO_DEST} \
${PROTO_DEST}/*.proto

# TypeScript compiling
mkdir -p ${BUILD_DEST}
cp -r ${OUTPUT_DEST}/* ${BUILD_DEST}