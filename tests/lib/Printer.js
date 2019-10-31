const {Printer} = require('../../build/lib/Printer');

test('Printer::getOutput', () => {
  const printer = new Printer(1);
  expect(printer.getOutput()).toBe('');
});

test('Printer::printLn', () => {
  const printer = new Printer(1);
  printer.printLn('String');
  expect(printer.getOutput()).toBe('  String\n');
});

test('Printer::print', () => {
  const printer = new Printer(1);
  printer.print('String');
  expect(printer.getOutput()).toBe('String');
});

test('Printer::printEmptyLn', () => {
  const printer = new Printer(1);
  printer.printLn('String');
  printer.printEmptyLn('String');
  printer.printLn('String');
  expect(printer.getOutput()).toBe('  String\n\n  String\n');
});

test('Printer::printIndentedLn', () => {
  const printer = new Printer(1);
  printer.printIndentedLn('String');
  expect(printer.getOutput()).toBe('    String\n');
});