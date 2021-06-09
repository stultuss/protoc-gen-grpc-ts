// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var product_pb = require('./product_pb.js');

function serialize_com_product_GetProductRequest(arg) {
  if (!(arg instanceof product_pb.GetProductRequest)) {
    throw new Error('Expected argument of type com.product.GetProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_com_product_GetProductRequest(buffer_arg) {
  return product_pb.GetProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_com_product_GetProductViaCategoryRequest(arg) {
  if (!(arg instanceof product_pb.GetProductViaCategoryRequest)) {
    throw new Error('Expected argument of type com.product.GetProductViaCategoryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_com_product_GetProductViaCategoryRequest(buffer_arg) {
  return product_pb.GetProductViaCategoryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_com_product_Product(arg) {
  if (!(arg instanceof product_pb.Product)) {
    throw new Error('Expected argument of type com.product.Product');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_com_product_Product(buffer_arg) {
  return product_pb.Product.deserializeBinary(new Uint8Array(buffer_arg));
}


var ProductServiceService = exports.ProductServiceService = {
  getProduct: {
    path: '/com.product.ProductService/GetProduct',
    requestStream: false,
    responseStream: false,
    requestType: product_pb.GetProductRequest,
    responseType: product_pb.Product,
    requestSerialize: serialize_com_product_GetProductRequest,
    requestDeserialize: deserialize_com_product_GetProductRequest,
    responseSerialize: serialize_com_product_Product,
    responseDeserialize: deserialize_com_product_Product,
  },
  getProductViaCategory: {
    path: '/com.product.ProductService/GetProductViaCategory',
    requestStream: false,
    responseStream: true,
    requestType: product_pb.GetProductViaCategoryRequest,
    responseType: product_pb.Product,
    requestSerialize: serialize_com_product_GetProductViaCategoryRequest,
    requestDeserialize: deserialize_com_product_GetProductViaCategoryRequest,
    responseSerialize: serialize_com_product_Product,
    responseDeserialize: deserialize_com_product_Product,
  },
  getBestProduct: {
    path: '/com.product.ProductService/GetBestProduct',
    requestStream: true,
    responseStream: false,
    requestType: product_pb.GetProductRequest,
    responseType: product_pb.Product,
    requestSerialize: serialize_com_product_GetProductRequest,
    requestDeserialize: deserialize_com_product_GetProductRequest,
    responseSerialize: serialize_com_product_Product,
    responseDeserialize: deserialize_com_product_Product,
  },
  getProducts: {
    path: '/com.product.ProductService/GetProducts',
    requestStream: true,
    responseStream: true,
    requestType: product_pb.GetProductRequest,
    responseType: product_pb.Product,
    requestSerialize: serialize_com_product_GetProductRequest,
    requestDeserialize: deserialize_com_product_GetProductRequest,
    responseSerialize: serialize_com_product_Product,
    responseDeserialize: deserialize_com_product_Product,
  },
};

exports.ProductServiceClient = grpc.makeGenericClientConstructor(ProductServiceService);
