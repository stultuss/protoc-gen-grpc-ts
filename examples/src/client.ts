import * as debug from 'debug';
import * as grpc from '@grpc/grpc-js';

import {ProductServiceClient} from './proto/product_grpc_pb';
import {GetProductRequest, GetProductViaCategoryRequest, Product} from './proto/product_pb';

const log = debug('[Demo:GrpcClient]');

const client = new ProductServiceClient('127.0.0.1:50051', grpc.credentials.createInsecure());

const getProduct = async (id: number) => {
    return new Promise<Product>((resolve, reject) => {
        const req = new GetProductRequest();
        req.setId(id);

        log(`[getProduct] Request: ${JSON.stringify(req.toObject())}`);

        client.getProduct(req, (e, data: Product) => {
            if (e) {
                debug(`[getProduct] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
                reject(e);
                return;
            }
            log(`[getProduct] Response: ${JSON.stringify(data.toObject())}`);
            resolve(data);
        });
    });
};

const getProductViaCategory = (category: string) => {
    return new Promise<void>((resolve, reject) => {
        const req = new GetProductViaCategoryRequest();
        req.setCategory(category);

        log(`[getProductViaCategory] Request: ${JSON.stringify(req.toObject())}`);

        const stream: grpc.ClientReadableStream<Product> = client.getProductViaCategory(req);
        stream.on('data', (data: Product) => {
            log(`[getProductViaCategory] Response: ${JSON.stringify(data.toObject())}`);
        });
        stream.on('end', () => {
            log('[getProductViaCategory] Done.');
            resolve();
        });
        stream.on('error', (e) => {
            log(`[getProductViaCategory] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
            reject(e);
        });
    });
};

const getBestProduct = () => {
    return new Promise<void>((resolve, reject) => {
        const stream: grpc.ClientWritableStream<GetProductRequest> = client.getBestProduct((e, data: Product) => {
            if (e) {
                log(`[getBestProduct] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
                reject(e);
                return;
            }
            log(`[getBestProduct] Response: ${JSON.stringify(data.toObject())}`);
            resolve();
        });

        for (let i = 15; i < 20; i++) {
            const req = new GetProductRequest();
            req.setId(i);
            log(`[getBestProduct] Response: ${JSON.stringify(req.toObject())}`);
            stream.write(req);
        }
        
        stream.end();
    });
};


const getProducts = () => {
    return new Promise<void>((resolve, reject) => {
        const stream: grpc.ClientDuplexStream<GetProductRequest, Product> = client.getProducts();

        stream.on('data', (data: Product) => {
            log(`[getProducts] Response: ${JSON.stringify(data.toObject())}`);
        });
        stream.on('end', () => {
            log('[getProducts] Done.');
            resolve();
        });
        stream.on('error', (e) => {
            log(`[getProducts] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
            reject(e);
        });

        for (let i = 15; i < 20; i++) {
            const vo = new GetProductRequest();
            vo.setId(i);
            log(`[getProducts] Request: ${JSON.stringify(vo.toObject())}`);
            stream.write(vo);
        }
        stream.end();
    });
};

async function main() {
    await getProduct(1);
    await getProductViaCategory('CategoryName');
    await getBestProduct();
    await getProducts()
}

main().then((_) => _);

process.on('uncaughtException', (err) => {
    log(`process on uncaughtException error: ${err}`);
});

process.on('unhandledRejection', (err) => {
    log(`process on unhandledRejection error: ${err}`);
});
