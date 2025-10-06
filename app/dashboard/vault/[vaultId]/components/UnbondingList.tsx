"use client";

import React, { useId } from "react";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { EpochDetails } from "./EpochDetails";
import { STRINGS } from "@/utils/strings";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { CopyButton } from "@/app/components/ui/CopyButton";

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
    <ul className={bare ? "space-y-2" : "mt-2 space-y-2"} aria-labelledby={bare ? undefined : titleId}>
      {entries.map((row, idx) => {
        const { validator, unlockEpoch, unstakeEpoch, remaining } = row;
        return (
          <li
            key={`${validator}-${idx}`}
            className="rounded border border-foreground/10 bg-background/70 p-3 dark:bg-background/50"
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <a
                  href={explorerAccountUrl(network, validator)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm underline truncate"
                  title={validator}
                  aria-label={`View validator ${validator} on explorer`}
                >
                  {truncateAccount(validator)}
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
          </li>
        );
      })}
    </ul>
  );

  if (bare) return List;

  return (
    <div className="mt-3 rounded border border-foreground/20 bg-background/80 text-foreground dark:bg-background/60 p-3">
      <div id={titleId} className="font-medium text-foreground">{STRINGS.waitingToUnlock}</div>
      {List}
      {/* ETA is rendered per entry above */}
    </div>
  );
}

const DEFAULT_TRUNCATE_LENGTH = 24;

function truncateAccount(id: string, max = DEFAULT_TRUNCATE_LENGTH) {
  if (id.length <= max) return id;
  const head = id.slice(0, Math.ceil(max / 2) - 2);
  const tail = id.slice(-Math.floor(max / 2) + 2);
  return `${head}…${tail}`;
}
