const assert = require('assert');
const path = require('path');
const {
  computeAcceptDisabled,
  computeAcceptTitle,
  computeAcceptLabel,
} = require(path.join(process.cwd(), 'tmp_build/app/dashboard/vault/[vaultId]/components/acceptActionsLogic.js'));
const { STRINGS } = require(path.join(process.cwd(), 'tmp_build/utils/strings.js'));

function run() {
  // Case: pending
  assert.equal(computeAcceptDisabled(true, false, true, true, true), true);
  assert.equal(computeAcceptLabel(true, false, true, true, true), STRINGS.accepting);

  // Case: loading
  assert.equal(computeAcceptDisabled(false, true, true, true, true), true);
  assert.equal(computeAcceptLabel(false, true, true, true, true), STRINGS.checkingBalance);

  // Case: lender not registered
  assert.equal(computeAcceptDisabled(false, false, true, false, true), true);
  assert.equal(computeAcceptLabel(false, false, false, true, true), STRINGS.registrationRequired);
  assert.equal(
    computeAcceptTitle(false, false, true, null, 6, 'USDC', '10', false, true),
    STRINGS.mustRegisterAccountBeforeAccept
  );

  // Case: vault not registered
  assert.equal(computeAcceptDisabled(false, false, true, true, false), true);
  assert.equal(computeAcceptLabel(false, false, true, false, true), STRINGS.vaultNotRegisteredShort);
  assert.equal(
    computeAcceptTitle(false, false, true, null, 6, 'USDC', '10', true, false),
    STRINGS.vaultMustBeRegisteredBeforeLending
  );

  // Case: insufficient balance
  const title = computeAcceptTitle(false, false, false, '1000000', 6, 'USDC', '0.5', true, true);
  assert.ok(title && title.startsWith('Need 1 '), 'Title should indicate need/have');
  assert.equal(computeAcceptLabel(false, false, true, true, false), STRINGS.insufficientBalance);
  assert.equal(computeAcceptDisabled(false, false, false, true, true), true);

  // Case: ready to accept
  assert.equal(computeAcceptDisabled(false, false, true, true, true), false);
  assert.equal(computeAcceptLabel(false, false, true, true, true), STRINGS.acceptRequest);
  assert.equal(computeAcceptTitle(false, false, true, null, 6, 'USDC', '10', true, true), undefined);
}

run();
console.log('acceptActions tests passed');

