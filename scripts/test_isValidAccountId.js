const assert = require('assert');
const path = require('path');

const { isValidAccountId } = require(path.join(process.cwd(), 'tmp_build/utils/validation/account.js'));

function run() {
  const valid = [
    'sudostake.near',
    'nzaza.testnet',
    'vault.factory.testnet',
    'abc-123_factory.testnet',
    'near', // single label, human-readable
    '0'.repeat(64), // implicit account hex
    '9065a7bda540c0724535c27adfe4824c88fbba63b4431dd2f82892ed68ea61c9', // implicit account example
  ];

  const invalid = [
    'A.near', // uppercase not allowed
    '-abc.near', // cannot start with '-'
    'abc-.near', // cannot end with '-'
    'a.near', // label too short (1)
    'abc..near', // empty label
    'abc._near', // label cannot start with '_'
    'a'.repeat(65), // total too long
    `${'a'.repeat(65)}.near`, // label too long
  ];

  for (const id of valid) {
    assert.strictEqual(isValidAccountId(id), true, `should be valid: ${id}`);
  }

  for (const id of invalid) {
    assert.strictEqual(isValidAccountId(id), false, `should be invalid: ${id}`);
  }

  console.log('isValidAccountId tests passed');
}

run();
