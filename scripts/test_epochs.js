const assert = require('assert');
const path = require('path');

const { analyzeUnstakeEntry } = require(path.join(process.cwd(), 'tmp_build/utils/epochs.js'));
const { NUM_EPOCHS_TO_UNLOCK } = require(path.join(process.cwd(), 'tmp_build/utils/constants.js'));

function testAnalyze(description, entryEpoch, currentEpoch, expected) {
  const got = analyzeUnstakeEntry(entryEpoch, currentEpoch, NUM_EPOCHS_TO_UNLOCK);
  try {
    assert.strictEqual(got.unstakeEpoch, entryEpoch, `${description}: unstakeEpoch`);
    assert.strictEqual(got.unlockEpoch, entryEpoch + NUM_EPOCHS_TO_UNLOCK, `${description}: unlockEpoch`);
    assert.strictEqual(got.matured, expected.matured, `${description}: matured`);
    assert.strictEqual(got.unbonding, expected.unbonding, `${description}: unbonding`);
    if (expected.remaining === null) assert.strictEqual(got.remaining, null, `${description}: remaining`);
    else assert.strictEqual(got.remaining, expected.remaining, `${description}: remaining`);
  } catch (e) {
    console.error('FAILED', description, got, expected);
    throw e;
  }
}

function run() {
  const n = NUM_EPOCHS_TO_UNLOCK;
  // Case A: just unstaked, current == entry; not matured, remaining = n
  testAnalyze('just-unstaked', 100, 100, { matured: false, unbonding: true, remaining: n });
  // Case B: one epoch later; remaining = n-1
  testAnalyze('one-epoch-later', 100, 101, { matured: false, unbonding: true, remaining: n - 1 });
  // Case C: at unlock epoch; matured (inclusive), remaining = 0
  testAnalyze('at-unlock', 100, 100 + n, { matured: true, unbonding: false, remaining: 0 });
  // Case D: after unlock epoch; matured, remaining = 0
  testAnalyze('after-unlock', 100, 100 + n + 2, { matured: true, unbonding: false, remaining: 0 });
  // Case E: unknown current epoch; remaining = null, unbonding = true (conservative), not matured
  testAnalyze('unknown-current', 100, null, { matured: false, unbonding: true, remaining: null });

  console.log('analyzeUnstakeEntry tests passed');
}

run();

