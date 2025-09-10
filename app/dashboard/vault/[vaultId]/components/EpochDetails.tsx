"use client";

import React from "react";
import { AVERAGE_EPOCH_SECONDS, NUM_EPOCHS_TO_UNLOCK } from "@/utils/constants";
import { STRINGS } from "@/utils/strings";
import { formatDateTime } from "@/utils/datetime";
import { formatDurationShort } from "@/utils/time";

type Props = {
  unlockEpoch: number;
  remaining: number | null;
  availableNow?: boolean;
  className?: string;
  unstakeEpoch?: number;
};

export function EpochDetails({ unlockEpoch, remaining, availableNow, className, unstakeEpoch }: Props) {
  const etaMs = React.useMemo(() => {
    if (availableNow) return 0;
    if (remaining === null) return null;
    return remaining * AVERAGE_EPOCH_SECONDS * 1000;
  }, [remaining, availableNow]);

  const pct = React.useMemo(() => {
    if (remaining === null || remaining < 0) return null;
    const done = NUM_EPOCHS_TO_UNLOCK - Math.min(NUM_EPOCHS_TO_UNLOCK, Math.max(0, remaining));
    const ratio = Math.max(0, Math.min(NUM_EPOCHS_TO_UNLOCK, done)) / NUM_EPOCHS_TO_UNLOCK;
    return Math.round(ratio * 100);
  }, [remaining]);

  return (
    <div className={className ?? "grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px] text-secondary-text"}>
      <div>
        <div className="uppercase tracking-wide">{STRINGS.unlockEpochLabel}</div>
        <div className="font-mono text-sm text-foreground">{unlockEpoch}</div>
      </div>
      <div>
        <div className="uppercase tracking-wide">{STRINGS.remainingLabel}</div>
        <div className="font-mono text-sm text-foreground">
          {remaining ?? "—"}
          {remaining !== null ? (remaining === 1 ? " epoch" : " epochs") : ""}
        </div>
      </div>
      <div>
        <div className="uppercase tracking-wide">{STRINGS.etaLabel}</div>
        <div className="font-mono text-sm text-foreground">
          {availableNow
            ? STRINGS.availableNowLabel
            : etaMs && etaMs > 0
            ? `~${formatDurationShort(etaMs)} (by ${formatDateTime(new Date(Date.now() + Math.max(0, etaMs)))})`
            : "—"}
        </div>
      </div>
      {pct !== null && (
        <div className="sm:col-span-3" aria-label="Unbonding progress">
          <div className="h-1.5 w-full bg-red-200 rounded">
            <div className="h-1.5 bg-red-500 rounded" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-secondary-text">{pct}%</div>
        </div>
      )}
      {typeof unstakeEpoch === 'number' && (
        <div className="sm:col-span-3 text-[11px]">Unstaked epoch: {unstakeEpoch}</div>
      )}
    </div>
  );
}
