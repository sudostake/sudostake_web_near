"use client";

import React from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { formatDurationShort } from "@/utils/time";
import { AVERAGE_EPOCH_SECONDS } from "@/utils/constants";

export type UnbondingEntryRow = {
  validator: string;
  amount: string; // yoctoNEAR
  unlockEpoch: number;
  unstakeEpoch: number;
  remaining: number | null; // epochs remaining until unlock
};


function computeUnbondingProgress(remaining: number | null, epochsToUnlock = 4): number | null {
  if (remaining === null) return null;
  const done = epochsToUnlock - Math.min(epochsToUnlock, Math.max(0, remaining));
  const ratio = Math.max(0, Math.min(epochsToUnlock, done)) / epochsToUnlock;
  return Math.round(ratio * 100);
}

type Props = {
  entries: UnbondingEntryRow[];
  currentEpoch: number | null;
};

export function UnbondingList({ entries, currentEpoch }: Props) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return (
    <div className="mt-3 rounded border border-red-400/30 bg-white/60 text-red-900 p-3">
      <div className="font-medium">Currently unbonding</div>
      <div className="mt-2 space-y-2">
        {entries.map((row, idx) => {
          const { validator, unlockEpoch, unstakeEpoch, remaining } = row;
          const pct = computeUnbondingProgress(remaining);
          const etaMs = remaining === null ? null : remaining * AVERAGE_EPOCH_SECONDS * 1000;
          return (
            <div key={`${validator}-${idx}`} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-red-900/80">Amount</div>
                <div className="font-medium">{safeFormatYoctoNear(row.amount)} NEAR</div>
              </div>
              <div>
                <div className="text-red-900/80">Unlock epoch</div>
                <div className="font-medium">{unlockEpoch}</div>
                {typeof currentEpoch === "number" && (
                  <div className="text-xs text-red-900/80">current: {currentEpoch}</div>
                )}
                <div className="text-xs text-red-900/80">unstaked at: {unstakeEpoch}</div>
              </div>
              <div>
                <div className="text-red-900/80">Validator</div>
                <div className="font-medium truncate" title={validator}>{validator}</div>
                {remaining !== null && (
                  <div className="text-xs text-red-900/80">
                    {remaining > 0 ? `≈ ${remaining} epoch${remaining === 1 ? "" : "s"} remaining` : "Unlocks this epoch"}
                  </div>
                )}
                {pct !== null && (
                  <div className="mt-1" aria-label="Unbonding progress">
                    <div className="h-1.5 w-full bg-red-200 rounded">
                      <div className="h-1.5 bg-red-500 rounded" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-red-900/80">{pct}%</div>
                  </div>
                )}
                {etaMs !== null && etaMs > 0 && (
                  <div className="mt-1 text-xs text-red-900/80">
                    ~{formatDurationShort(etaMs)} remaining (ETA {new Date(Date.now() + Math.max(0, etaMs)).toLocaleString()})
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
