``` bash
npm install matrixes-cli -g --unsafe-perm

matrixes-protoc --js_out=import_style=commonjs,binary:./src --grpc_out=./src --proto_path ./proto ./proto/book.proto

matrixes-protoc-gen-ts --ts_out=service=true:./src --proto_path ./proto ./proto/book.proto
```