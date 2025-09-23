const assert = require('assert');
const path = require('path');

const strings = require(path.join(process.cwd(), 'tmp_build/utils/strings.js'));

function testIncludesMatured() {
  const s = strings.includesMaturedString('12.34');
  assert.strictEqual(s, 'Includes 12.34 NEAR matured');
}

function testStorageDeposit() {
  const s = strings.storageDepositString('0.0123');
  assert.strictEqual(s, 'This is a one-time storage deposit of 0.0123 NEAR.');
}

function testFundedBy() {
  const s = strings.fundedByString('alice.near');
  assert.strictEqual(s, 'Funded by alice.near');
}

function testStartLiquidationIn() {
  const s = strings.startLiquidationInString('3h 12m');
  assert.strictEqual(s, 'Start liquidation in 3h 12m');
}

testIncludesMatured();
testStorageDeposit();
testFundedBy();
testStartLiquidationIn();
console.log('strings tests passed');

