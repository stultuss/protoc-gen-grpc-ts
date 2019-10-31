const {MessageOptions, FileDescriptorProto} = require('google-protobuf/google/protobuf/descriptor_pb');

const mock = require('../../mocks/lib/Utility');
const {Utility} = require('../../build/lib/Utility');

test('filePathToPseudoNamespace ', () => {
  expect(Utility.filePathToPseudoNamespace('book_market.proto')).toBe('book_market_pb');
});

test('snakeToCamel ', () => {
  expect(Utility.snakeToCamel('book_market')).toBe('bookMarket');
});

test('ucFirst', () => {
  expect(Utility.ucFirst('bookMarket')).toBe('BookMarket');
});

test('lcFirst', () => {
  expect(Utility.lcFirst('BookMarket')).toBe('bookMarket');
});

test('isProto2', () => {
  expect(Utility.isProto2(new FileDescriptorProto())).toBe(true);
});

test('oneOfName', () => {
  expect(Utility.oneOfName('book_market')).toBe('BookMarket');
});

test('generateIndent', () => {
  expect(Utility.generateIndent(4)).toBe('        ');
});

test('getPathToRoot', () => {
  expect(Utility.getPathToRoot('/opt/proto/com.book_market.proto')).toBe('../../../');
});

test('withinNamespaceFromExportEntry', () => {
  const fieldEnumType = {
    pkg: 'com',
    fileName: 'com.book_market.proto',
    messageOptions: new MessageOptions()
  };
  expect(Utility.withinNamespaceFromExportEntry('com.book_market.proto', fieldEnumType)).toBe('book_market.proto');
});

test('filePathFromProtoWithoutExtension', () => {
  expect(Utility.filePathFromProtoWithoutExtension('book_market.proto')).toBe('book_market_pb');
});

test('svcFilePathFromProtoWithoutExtension', () => {
  expect(Utility.svcFilePathFromProtoWithoutExtension('book_market.proto')).toBe('book_market_grpc_pb');
});

test('withAllStdIn', async () => {
  expect.assertions(4);
  
  const spyFn = jest.spyOn(Utility, 'withAllStdIn');
  const input = 'test';
  const output = await mock.withAllStdIn(Buffer.alloc(input.length, input));
  expect(output.length).toBe(input.length);
  expect(output.toString()).toBe(input);
  expect(spyFn).toHaveBeenCalled();
  expect(spyFn).toHaveBeenCalledTimes(1);
});

test('normaliseFieldObjectName', () => {
  expect.assertions(3);
  expect(Utility.normaliseFieldObjectName('test')).toBe('test');
  expect(Utility.normaliseFieldObjectName('abstract')).toBe('pb_abstract');
  expect(Utility.normaliseFieldObjectName('with')).toBe('pb_with');
});
