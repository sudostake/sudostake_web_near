const assert = require('assert');
const path = require('path');

const { shortAmount, formatMinimalTokenAmount, parseNumber } = require(path.join(process.cwd(), 'tmp_build/utils/format.js'));

function testShortAmount() {
  assert.strictEqual(shortAmount('123'), '123', 'integer remains integer');
  assert.strictEqual(shortAmount('123.456789123', 6), '123.456789', 'trim to 6 decimals');
  assert.strictEqual(shortAmount('1.230000', 6), '1.23', 'trim trailing zeros');
  assert.strictEqual(shortAmount('1.0000001', 6), '1', 'all-trimmed fractional removed');
  assert.strictEqual(shortAmount('0.000000', 6), '0', 'zero fractional collapses');
  assert.strictEqual(shortAmount('9.87654321', 4), '9.8765', 'custom max decimals');
}

function testFormatMinimalTokenAmount() {
  assert.strictEqual(formatMinimalTokenAmount('123456789', 6), '123.456789', 'basic split');
  assert.strictEqual(formatMinimalTokenAmount('0000123', 2), '1.23', 'leading zeros');
  assert.strictEqual(formatMinimalTokenAmount('123', 6), '0.000123', 'pad small minimal');
  assert.strictEqual(formatMinimalTokenAmount('-12345', 3), '-12.345', 'negative minimal');
  assert.strictEqual(formatMinimalTokenAmount('0000', 0), '0', 'decimals 0 and zeros');
  assert.strictEqual(formatMinimalTokenAmount('1', 0), '1', 'decimals 0 basic');
  assert.strictEqual(formatMinimalTokenAmount('1000000', 6), '1', 'trim all fractional zeros');
  assert.strictEqual(formatMinimalTokenAmount('1000001', 6), '1.000001', 'preserve non-zero fraction');
}

function testParseNumber() {
  assert.strictEqual(parseNumber('1,234.56'), 1234.56, 'commas');
  assert.strictEqual(parseNumber('  987_654.321  '), 987654.321, 'underscores/spaces');
  assert.ok(Number.isNaN(parseNumber('not a number')), 'invalid -> NaN');
}

function run() {
  testShortAmount();
  testFormatMinimalTokenAmount();
  testParseNumber();
  console.log('format utils tests passed');
}

run();
