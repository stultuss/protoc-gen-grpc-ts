"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const grpc = require("@grpc/grpc-js");
const product_grpc_pb_1 = require("./proto/product_grpc_pb");
const product_pb_1 = require("./proto/product_pb");
const log = debug('[Demo:GrpcServer]');
const ServerImpl = {
    getProduct: (call, callback) => {
        log(`[getProduct] Request: ${JSON.stringify(call.request.toObject())}`);
        const vo = new product_pb_1.Product();
        vo.setId(call.request.getId());
        vo.setName('DefaultName');
        vo.setCategory('DefaultCategory');
        log(`[getProduct] Done: ${JSON.stringify(vo.toObject())}`);
        callback(null, vo);
    },
    getProductViaCategory: (call) => {
        log(`[getProductViaCategory] Request: ${JSON.stringify(call.request.toObject())}`);
        for (let i = 1; i <= 10; i++) {
            const vo = new product_pb_1.Product();
            vo.setId(i);
            vo.setName('DefaultName' + i);
            vo.setCategory('CategoryName=' + call.request.getCategory());
            log(`[getProductViaCategory] Write: ${JSON.stringify(vo.toObject())}`);
            call.write(vo);
        }
        log('[getProductViaCategory] Done.');
        call.end();
    },
    getBestProduct: (call, callback) => {
        let lastOne;
        call.on('data', (request) => {
            log(`[getBestProduct] Request: ${JSON.stringify(request.toObject())}`);
            lastOne = request;
        });
        call.on('end', () => {
            const vo = new product_pb_1.Product();
            vo.setId(lastOne.getId());
            vo.setName('LastOneName');
            vo.setCategory('LastOneCategory');
            log(`[getBestProduct] Done: ${JSON.stringify(vo.toObject())}`);
            callback(null, vo);
        });
        call.on('error', (e) => {
            console.log(e);
        });
    },
    getProducts: (call) => {
        call.on('data', (request) => {
            const vo = new product_pb_1.Product();
            vo.setId(request.getId());
            vo.setName('NameOf' + request.getId());
            vo.setCategory('CategoryOf' + request.getId());
            log(`[getProducts] Write: ${JSON.stringify(vo.toObject())}`);
            call.write(vo);
        });
        call.on('end', () => {
            log('[getProducts] Done.');
            call.end();
        });
        call.on('error', (e) => {
            console.log(e);
        });
    }
};
function startServer() {
    const server = new grpc.Server();
    server.addService(product_grpc_pb_1.ProductServiceService, ServerImpl);
    server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (e, port) => {
        if (e)
            throw e;
        log(`Server started, listening: 127.0.0.1:${port}`);
        server.start();
    });
}
startServer();
process.on('uncaughtException', (err) => {
    log(`process on uncaughtException error: ${err}`);
});
process.on('unhandledRejection', (err) => {
    log(`process on unhandledRejection error: ${err}`);
});
//# sourceMappingURL=server.js.map