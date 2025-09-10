import { NUM_EPOCHS_TO_UNLOCK } from "./constants";

/**
 * Canonical analyzer for an unstake entry's epoch timing.
 *
 * Assumptions:
 * - entryEpoch is the target unlock epoch provided by the on-chain view.
 * - currentEpoch is the current chain epoch (or null if unknown).
 * - An entry is considered matured at the unlock epoch or later: current >= unlock.
 * - While current < unlock, the entry is still unbonding.
 */
export function analyzeUnstakeEntry(
  entryEpoch: number,
  currentEpoch: number | null,
  epochsToUnlock: number = NUM_EPOCHS_TO_UNLOCK
) {
  // Contract semantics: entryEpoch is the epoch when unstake happened.
  // Funds become claimable when current_epoch >= entry_epoch + epochsToUnlock.
  const unstakeEpoch = Math.max(0, entryEpoch);
  const unlockEpoch = unstakeEpoch + epochsToUnlock;
  const remaining = currentEpoch === null ? null : Math.max(0, unlockEpoch - currentEpoch);
  // Contract: claimable when current_epoch >= entry.epoch_height + epochsToUnlock
  const matured = currentEpoch !== null && currentEpoch >= unlockEpoch;
  const unbonding = currentEpoch === null || currentEpoch < unlockEpoch;
  return { unlockEpoch, unstakeEpoch, remaining, matured, unbonding };
}
