"use client";

import React from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { EpochDetails } from "./EpochDetails";

export type UnbondingEntryRow = {
  validator: string;
  amount: string; // yoctoNEAR
  unlockEpoch: number;
  unstakeEpoch: number;
  remaining: number | null; // epochs remaining until unlock
};


// Progress is shown via EpochDetails; no local progress calculation needed

type Props = {
  entries: UnbondingEntryRow[];
};

export function UnbondingList({ entries }: Props) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  return (
    <div className="mt-3 rounded border border-red-400/30 bg-white/60 text-red-900 p-3">
      <div className="font-medium">Currently unbonding</div>
      <div className="mt-2 space-y-2">
        {entries.map((row, idx) => {
          const { validator, unlockEpoch, unstakeEpoch, remaining } = row;
          return (
            <div key={`${validator}-${idx}`} className="text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="text-red-900/80">Amount</div>
                  <div className="font-medium">{safeFormatYoctoNear(row.amount)} NEAR</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-red-900/80">Validator</div>
                  <div className="font-medium truncate" title={validator}>{validator}</div>
                </div>
              </div>
              <div className="mt-2">
                <EpochDetails
                  unlockEpoch={unlockEpoch}
                  remaining={remaining}
                  unstakeEpoch={unstakeEpoch}
                />
              </div>
            </div>
          );
        })}
              </div>
              {/* ETA is rendered per entry above */}
    </div>
  );
}
