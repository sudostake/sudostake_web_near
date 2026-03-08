"use client";

import React, { useId } from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { EpochDetails } from "./EpochDetails";
import { STRINGS } from "@/utils/strings";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { CopyButton } from "@/app/components/ui/CopyButton";

export type UnbondingEntryRow = {
  validator: string;
  amount: string;
  unlockEpoch: number;
  unstakeEpoch: number;
  remaining: number | null;
};

type Props = {
  entries: UnbondingEntryRow[];
  bare?: boolean;
};

export function UnbondingList({ entries, bare = false }: Props) {
  const titleId = useId();
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const network = getActiveNetwork();

  const list = (
    <ul className="divide-y divide-foreground/10" aria-labelledby={bare ? undefined : titleId}>
      {entries.map((row, idx) => (
        <li key={`${row.validator}-${idx}`} className="py-4 first:pt-0 last:pb-0">
          <div className="grid gap-x-6 gap-y-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
            <div className="min-w-0 space-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <a
                  href={explorerAccountUrl(network, row.validator)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-sm underline"
                  title={row.validator}
                  aria-label={`View validator ${row.validator} on explorer`}
                >
                  {row.validator}
                </a>
                <CopyButton value={row.validator} title="Copy validator" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                  {STRINGS.amountLabel}
                </div>
                <div className="font-mono text-sm text-foreground">{safeFormatYoctoNear(row.amount)} NEAR</div>
              </div>
            </div>

            <EpochDetails
              unlockEpoch={row.unlockEpoch}
              remaining={row.remaining}
              unstakeEpoch={row.unstakeEpoch}
            />
          </div>
        </li>
      ))}
    </ul>
  );

  if (bare) return list;

  return (
    <section className="space-y-4" role="region" aria-labelledby={titleId}>
      <div className="space-y-1">
        <div id={titleId} className="text-sm font-semibold text-foreground">
          {STRINGS.waitingToUnlock}
        </div>
        <p className="text-sm text-secondary-text">
          Delegations queued to unlock. These amounts only become claimable once the validator unlock window completes.
        </p>
      </div>
      {list}
    </section>
  );
}
