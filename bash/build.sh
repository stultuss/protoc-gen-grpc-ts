#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd ${BASEDIR}/../

PROTO_DEST=./examples/proto
OUTPUT_DEST=./examples/src/proto
BUILD_DEST=./examples/build/proto

mkdir -p ${OUTPUT_DEST}

# JavaScript code generating
node ./bin/protoc-gen-grpc.js \
--js_out=import_style=commonjs,binary:${OUTPUT_DEST} \
--grpc_out=grpc_js:${OUTPUT_DEST} \
--proto_path ${PROTO_DEST} \
${PROTO_DEST}/*.proto

node ./bin/protoc-gen-grpc-ts.js \
--ts_out=grpc_js:${OUTPUT_DEST} \
--proto_path ${PROTO_DEST} \
${PROTO_DEST}/*.proto

# TypeScript compiling
mkdir -p ${BUILD_DEST}
cp -r ${OUTPUT_DEST}/* ${BUILD_DEST}
tsc