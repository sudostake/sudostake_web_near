const assert = require('assert');
const path = require('path');

const { transformVaultState } = require(path.join(process.cwd(), 'tmp_build/utils/transformers/transform_vault_state.js'));

function run() {
  // Case 1: accepted_at provided as string nanoseconds to preserve precision
  const raw1 = {
    owner: 'alice.near',
    liquidity_request: {
      token: 'usdc', amount: '100', interest: '1', collateral: '200', duration: 3600,
    },
    accepted_offer: {
      lender: 'bob.near',
      accepted_at: '1700000000123456789',
    },
  };
  const t1 = transformVaultState(raw1);
  assert(t1.accepted_offer, 'accepted_offer should be present');
  assert.strictEqual(t1.accepted_offer.accepted_at.seconds, 1700000000);
  assert.strictEqual(t1.accepted_offer.accepted_at.nanoseconds, 123456789);

  // Case 2: accepted_at provided as number (may have precision loss), ensure ms rounding used
  const ns2 = 1700000000456789123; // as number (precision-losing), but we just ensure fromMillis rounding logic
  const raw2 = {
    owner: 'alice.near',
    accepted_offer: {
      lender: 'carol.near',
      accepted_at: ns2,
    },
  };
  const t2 = transformVaultState(raw2);
  const expectedMs2 = Math.round(ns2 / 1_000_000);
  assert.strictEqual(t2.accepted_offer.accepted_at.toMillis(), expectedMs2);

  console.log('transformVaultState tests passed');
}

run();

