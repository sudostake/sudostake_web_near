"use client";

import React, { useId } from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { EpochDetails } from "./EpochDetails";
import { STRINGS } from "@/utils/strings";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { Card } from "@/app/components/ui/Card";

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
  /**
   * When true, renders only the list of validator rows, without the outer
   * container and title. Useful when the parent already provides the header
   * and surrounding card/chrome.
   */
  bare?: boolean;
};

export function UnbondingList({ entries, bare = false }: Props) {
  const titleId = useId();
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const network = getActiveNetwork();
  const List = (
    <ul className={bare ? "space-y-3" : "mt-3 space-y-3"} aria-labelledby={bare ? undefined : titleId}>
      {entries.map((row, idx) => {
        const { validator, unlockEpoch, unstakeEpoch, remaining } = row;
        return (
          <li key={`${validator}-${idx}`}>
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <a
                    href={explorerAccountUrl(network, validator)}
                    target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm underline break-all"
                  title={validator}
                  aria-label={`View validator ${validator} on explorer`}
                >
                  {validator}
                </a>
                <CopyButton value={validator} title="Copy validator" />
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.amountLabel}</div>
                <div className="font-mono text-sm">{safeFormatYoctoNear(row.amount)} NEAR</div>
              </div>
            </div>
            <div className="mt-2">
              <EpochDetails
                unlockEpoch={unlockEpoch}
                remaining={remaining}
                unstakeEpoch={unstakeEpoch}
              />
            </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );

  if (bare) return List;

  return (
    <Card className="space-y-3" role="region" aria-labelledby={titleId}>
      <div id={titleId} className="text-sm font-semibold text-foreground">{STRINGS.waitingToUnlock}</div>
      <p className="text-xs text-secondary-text">Delegations queued to unlock. Claimable amounts move here before reaching your available balance.</p>
      {List}
      {/* ETA is rendered per entry above */}
    </Card>
  );
}
