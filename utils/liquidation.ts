import { safeFormatYoctoNear } from "@/utils/formatNear";
import { toYoctoBigInt } from "@/utils/numbers";
import { analyzeUnstakeEntry } from "@/utils/epochs";
import { AVERAGE_EPOCH_SECONDS } from "@/utils/constants";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";

export function computeRemainingYocto(
  collateralYocto: string | number | bigint | undefined,
  liquidatedYocto: string | number | bigint | undefined
): bigint | null {
  try {
    if (!collateralYocto) return null;
    const col = toYoctoBigInt(collateralYocto);
    const liq = toYoctoBigInt(liquidatedYocto ?? "0");
    return col > liq ? col - liq : BigInt(0);
  } catch {
    return null;
  }
}

export function computeMaturedTotals(summary?: DelegationSummaryEntry[] | null): {
  maturedYocto: bigint;
  maturedTotalLabel: string | null;
  maturedEntries: Array<{ validator: string; amount: string }>;
} {
  try {
    const list = summary ?? [];
    let sum = BigInt(0);
    const rows: Array<{ validator: string; amount: string }> = [];
    for (const s of list) {
      if (!s.can_withdraw) continue;
      if (!s.unstaked_balance?.minimal) continue;
      const amt = s.unstaked_balance.minimal;
      sum += BigInt(amt);
      rows.push({ validator: s.validator, amount: amt });
    }
    return {
      maturedYocto: sum,
      maturedTotalLabel: sum === BigInt(0) ? null : safeFormatYoctoNear(sum.toString(), 5),
      maturedEntries: rows,
    };
  } catch {
    return { maturedYocto: BigInt(0), maturedTotalLabel: null, maturedEntries: [] };
  }
}

export function computeUnbondingTotals(
  summary?: DelegationSummaryEntry[] | null,
  currentEpoch?: number | null
): {
  unbondingYocto: bigint;
  unbondingTotalLabel: string | null;
  unbondingEntries: Array<{ validator: string; amount: string; unlockEpoch: number; unstakeEpoch: number; remaining: number | null }>;
  longestRemainingEpochs: number | null;
} {
  try {
    const list = summary ?? [];
    let sum = BigInt(0);
    let longestRem = 0;
    const rows: Array<{ validator: string; amount: string; unlockEpoch: number; unstakeEpoch: number; remaining: number | null }> = [];
    for (const s of list) {
      if (s.can_withdraw) continue; // matured handled separately
      const amt = s.unstaked_balance?.minimal;
      if (!amt) continue;
      if (s.unstaked_at === undefined) continue;
      const info = analyzeUnstakeEntry(s.unstaked_at, currentEpoch ?? null);
      if (!info.unbonding) continue;
      sum += BigInt(amt);
      rows.push({ validator: s.validator, amount: amt, unlockEpoch: info.unlockEpoch, unstakeEpoch: info.unstakeEpoch, remaining: info.remaining });
      const rem = info.remaining ?? 0;
      if (rem > longestRem) longestRem = rem;
    }
    rows.sort((a, b) => a.unlockEpoch - b.unlockEpoch);
    return {
      unbondingYocto: sum,
      unbondingTotalLabel: sum === BigInt(0) ? null : safeFormatYoctoNear(sum.toString(), 5),
      unbondingEntries: rows,
      longestRemainingEpochs: longestRem || null,
    };
  } catch {
    return { unbondingYocto: BigInt(0), unbondingTotalLabel: null, unbondingEntries: [], longestRemainingEpochs: null };
  }
}

export function computeExpectedImmediate(
  availableMinimal?: string | null,
  remainingYocto?: bigint | null
): { yocto: bigint; label: string | null } {
  try {
    const avail = BigInt(availableMinimal ?? "0");
    const target = remainingYocto ?? avail;
    const imm = avail < target ? avail : target;
    return { yocto: imm, label: imm === BigInt(0) ? null : safeFormatYoctoNear(imm.toString(), 5) };
  } catch {
    return { yocto: BigInt(0), label: null };
  }
}

export function computeExpectedNext(
  availableMinimal?: string | null,
  remainingYocto?: bigint | null,
  maturedYocto?: bigint,
  unbondingYocto?: bigint
): { yocto: bigint; label: string | null } {
  try {
    const avail = BigInt(availableMinimal ?? "0");
    const target = remainingYocto ?? avail;
    const imm = avail < target ? avail : target;
    let total = imm + (maturedYocto ?? BigInt(0)) + (unbondingYocto ?? BigInt(0));
    if (remainingYocto !== null && remainingYocto !== undefined && total > remainingYocto) total = remainingYocto;
    return { yocto: total, label: total === BigInt(0) ? null : safeFormatYoctoNear(total.toString(), 5) };
  } catch {
    return { yocto: BigInt(0), label: null };
  }
}

export function computeClaimableNow(
  expectedImmediateYocto: bigint,
  maturedYocto: bigint,
  remainingYocto?: bigint | null
): { yocto: bigint; label: string } {
  try {
    let total = (expectedImmediateYocto ?? BigInt(0)) + (maturedYocto ?? BigInt(0));
    if (remainingYocto !== null && remainingYocto !== undefined && total > remainingYocto) total = remainingYocto;
    return { yocto: total, label: safeFormatYoctoNear(total.toString(), 5) };
  } catch {
    return { yocto: BigInt(0), label: "0" };
  }
}

export function computeLongestEtaLabel(longestRemainingEpochs: number | null): string | null {
  try {
    if (longestRemainingEpochs === null) return null;
    const ms = longestRemainingEpochs * AVERAGE_EPOCH_SECONDS * 1000;
    return ms > 0 ? `~${Math.round(ms / (60 * 1000))}m` : null;
  } catch {
    return null;
  }
}

