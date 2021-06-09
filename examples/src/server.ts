import * as debug from 'debug';
// support grpc-js
import * as grpc from '@grpc/grpc-js';
// support grpc
// import * as grpc from 'grpc';

import {IProductServiceServer, ProductServiceService} from './proto/product_grpc_pb';
import {GetProductRequest, GetProductViaCategoryRequest, Product} from './proto/product_pb';

const log = debug('[Demo:GrpcServer]');

const ServerImpl: IProductServiceServer = {
    
    getProduct: (call: grpc.ServerUnaryCall<GetProductRequest, Product>, callback: grpc.sendUnaryData<Product>): void => {
        log(`[getProduct] Request: ${JSON.stringify(call.request.toObject())}`);
        
        const vo = new Product();
        vo.setId(call.request.getId());
        vo.setName('DefaultName');
        vo.setCategory('DefaultCategory');
        
        log(`[getProduct] Done: ${JSON.stringify(vo.toObject())}`);
        callback(null, vo);
    },
    
    getProductViaCategory: (call: grpc.ServerWritableStream<GetProductViaCategoryRequest, Product>): void => {
        log(`[getProductViaCategory] Request: ${JSON.stringify(call.request.toObject())}`);
        for (let i = 1; i <= 10; i++) {
            const vo = new Product();
            vo.setId(i);
            vo.setName('DefaultName' + i);
            vo.setCategory('CategoryName=' + call.request.getCategory());
            
            log(`[getProductViaCategory] Write: ${JSON.stringify(vo.toObject())}`);
            call.write(vo);
        }
        log('[getProductViaCategory] Done.');
        call.end();
    },
    
    getBestProduct: (call: grpc.ServerReadableStream<GetProductRequest, Product>, callback: grpc.sendUnaryData<Product>): void => {
        let lastOne: GetProductRequest;
        call.on('data', (request: GetProductRequest) => {
            log(`[getBestProduct] Request: ${JSON.stringify(request.toObject())}`);
            lastOne = request;
        });
        call.on('end', () => {
            const vo = new Product();
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
    
    getProducts: (call: grpc.ServerDuplexStream<GetProductRequest, Product>): void => {
        call.on('data', (request: GetProductRequest) => {
            
            const vo = new Product();
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
    // support grpc-js
    server.addService(ProductServiceService, ServerImpl);
    // support grpc-js
    // server.addService(ProductServiceService, new ServerImpl());
    server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (e, port) => {
        if (e) throw e;
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
