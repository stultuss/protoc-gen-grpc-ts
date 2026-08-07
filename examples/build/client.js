"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const grpc = require("@grpc/grpc-js");
const product_grpc_pb_1 = require("./proto/product_grpc_pb");
const product_pb_1 = require("./proto/product_pb");
const log = debug('[Demo:GrpcClient]');
const client = new product_grpc_pb_1.ProductServiceClient('127.0.0.1:50051', grpc.credentials.createInsecure());
const getProduct = async (id) => {
    return new Promise((resolve, reject) => {
        const req = new product_pb_1.GetProductRequest();
        req.setId(id);
        log(`[getProduct] Request: ${JSON.stringify(req.toObject())}`);
        client.getProduct(req, (e, data) => {
            if (e) {
                debug(`[getProduct] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
                reject(e);
                return;
            }
            log(`[getProduct] Response: ${JSON.stringify(data.toObject())}`);
            // proto3 optional: hasRemark()/getRemark()
            if (data.hasRemark()) {
                log(`[getProduct] remark: ${data.getRemark()}`);
            }
            log(`[getProduct] bigId: ${data.getBigId()}`); // [jstype = JS_STRING]
            resolve(data);
        });
    });
};
const extensionDemo = () => {
    const demo = new product_pb_1.ExtensionDemo();
    demo.setExtension$('demo-value'); // occupied field name -> $ suffix
    log(`[extensionDemo] extension$: ${demo.getExtension$()}`);
};
const createOrder = () => {
    return new Promise((resolve, reject) => {
        const order = new product_pb_1.Order();
        order.setCash(100); // oneof: set the cash field
        log(`[createOrder] Request: paymentCase=${order.getPaymentCase()}`);
        client.createOrder(order, (e, data) => {
            if (e) {
                debug(`[createOrder] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
                reject(e);
                return;
            }
            const paid = data.getPaymentCase() === product_pb_1.Order.PaymentCase.CASH
                ? `cash ${data.getCash()}`
                : `card ${data.getCard()}`;
            log(`[createOrder] Response: paid by ${paid}`);
            resolve();
        });
    });
};
const getProductViaCategory = (category) => {
    return new Promise((resolve, reject) => {
        const req = new product_pb_1.GetProductViaCategoryRequest();
        req.setCategory(category);
        log(`[getProductViaCategory] Request: ${JSON.stringify(req.toObject())}`);
        const stream = client.getProductViaCategory(req);
        stream.on('data', (data) => {
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
    return new Promise((resolve, reject) => {
        const stream = client.getBestProduct((e, data) => {
            if (e) {
                log(`[getBestProduct] err:\nerr.message: ${e.message}\nerr.stack:\n${e.stack}`);
                reject(e);
                return;
            }
            log(`[getBestProduct] Response: ${JSON.stringify(data.toObject())}`);
            resolve();
        });
        for (let i = 15; i < 20; i++) {
            const req = new product_pb_1.GetProductRequest();
            req.setId(i);
            log(`[getBestProduct] Response: ${JSON.stringify(req.toObject())}`);
            stream.write(req);
        }
        stream.end();
    });
};
const getProducts = () => {
    return new Promise((resolve, reject) => {
        const stream = client.getProducts();
        stream.on('data', (data) => {
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
            const vo = new product_pb_1.GetProductRequest();
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
    await getProducts();
    await createOrder();
    extensionDemo();
}
main().then((_) => _);
process.on('uncaughtException', (err) => {
    log(`process on uncaughtException error: ${err}`);
});
process.on('unhandledRejection', (err) => {
    log(`process on unhandledRejection error: ${err}`);
});
//# sourceMappingURL=client.js.map