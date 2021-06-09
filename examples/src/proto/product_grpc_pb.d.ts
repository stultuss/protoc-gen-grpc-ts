// package: com.product
// file: product.proto

import * as grpc from '@grpc/grpc-js';
import * as product_pb from './product_pb';

interface IProductServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getProduct: IProductServiceService_IGetProduct;
  getProductViaCategory: IProductServiceService_IGetProductViaCategory;
  getBestProduct: IProductServiceService_IGetBestProduct;
  getProducts: IProductServiceService_IGetProducts;
}

interface IProductServiceService_IGetProduct extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetProductViaCategory extends grpc.MethodDefinition<product_pb.GetProductViaCategoryRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProductViaCategory'
  requestStream: false
  responseStream: true
  requestSerialize: grpc.serialize<product_pb.GetProductViaCategoryRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductViaCategoryRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetBestProduct extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetBestProduct'
  requestStream: true
  responseStream: false
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

interface IProductServiceService_IGetProducts extends grpc.MethodDefinition<product_pb.GetProductRequest, product_pb.Product> {
  path: '/com.product.ProductService/GetProducts'
  requestStream: true
  responseStream: true
  requestSerialize: grpc.serialize<product_pb.GetProductRequest>;
  requestDeserialize: grpc.deserialize<product_pb.GetProductRequest>;
  responseSerialize: grpc.serialize<product_pb.Product>;
  responseDeserialize: grpc.deserialize<product_pb.Product>;
}

export const ProductServiceService: IProductServiceService;
export interface IProductServiceServer extends grpc.UntypedServiceImplementation {
  getProduct: grpc.handleUnaryCall<product_pb.GetProductRequest, product_pb.Product>;
  getProductViaCategory: grpc.handleServerStreamingCall<product_pb.GetProductViaCategoryRequest, product_pb.Product>;
  getBestProduct: grpc.handleClientStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
  getProducts: grpc.handleBidiStreamingCall<product_pb.GetProductRequest, product_pb.Product>;
}

export interface IProductServiceClient {
  getProduct(request: product_pb.GetProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  getBestProduct(callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getBestProduct(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  getProducts(): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  getProducts(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  getProducts(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
}

export class ProductServiceClient extends grpc.Client implements IProductServiceClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
  public getProduct(request: product_pb.GetProductRequest, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProduct(request: product_pb.GetProductRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientUnaryCall;
  public getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  public getProductViaCategory(request: product_pb.GetProductViaCategoryRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<product_pb.Product>;
  public getBestProduct(callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getBestProduct(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: product_pb.Product) => void): grpc.ClientWritableStream<product_pb.GetProductRequest>;
  public getProducts(): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  public getProducts(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
  public getProducts(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<product_pb.GetProductRequest, product_pb.Product>;
}

