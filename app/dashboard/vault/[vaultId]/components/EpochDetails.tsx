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

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

export function EpochDetails({ unlockEpoch, remaining, availableNow, className, unstakeEpoch }: Props) {
  const etaMs = React.useMemo(() => {
    if (availableNow) return 0;
    if (remaining === null) return null;
    return remaining * AVERAGE_EPOCH_SECONDS * 1000;
  }, [availableNow, remaining]);

  const pct = React.useMemo(() => {
    if (remaining === null || remaining < 0) return null;
    const done = NUM_EPOCHS_TO_UNLOCK - Math.min(NUM_EPOCHS_TO_UNLOCK, Math.max(0, remaining));
    const ratio = Math.max(0, Math.min(NUM_EPOCHS_TO_UNLOCK, done)) / NUM_EPOCHS_TO_UNLOCK;
    return Math.round(ratio * 100);
  }, [remaining]);

  const etaLabel = availableNow
    ? STRINGS.availableNowLabel
    : etaMs && etaMs > 0
      ? `~${formatDurationShort(etaMs)} (by ${formatDateTime(new Date(Date.now() + Math.max(0, etaMs)))})`
      : "—";

  const remainingLabel = remaining === null ? "—" : `${remaining} ${remaining === 1 ? "epoch" : "epochs"}`;

  return (
    <div className={["space-y-3", className].filter(Boolean).join(" ")}>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        <Field label={STRINGS.unlockEpochLabel} value={String(unlockEpoch)} />
        <Field label={STRINGS.remainingLabel} value={remainingLabel} />
        <Field label={STRINGS.etaLabel} value={etaLabel} />
      </div>

      {pct !== null && (
        <div className="space-y-1" aria-label="Unbonding progress">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-secondary-text">
            {pct}% through unlock window
            {unstakeEpoch !== undefined ? ` · unstaked at epoch ${unstakeEpoch}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
