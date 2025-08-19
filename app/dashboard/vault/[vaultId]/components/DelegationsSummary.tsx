"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";

// Enum representing the delegation summary status for a validator entry
export enum DelegationStatus {
  Withdrawable = "withdrawable",
  Unstaking = "unstaking",
  Active = "active",
}

function truncateAccount(id: string, max = 24) {
  if (id.length <= max) return id;
  const head = id.slice(0, Math.ceil(max / 2) - 2);
  const tail = id.slice(-Math.floor(max / 2) + 2);
  return `${head}…${tail}`;
}

function summaryStatus(entry: DelegationSummaryEntry): DelegationStatus | null {
  const unstakedParsed = parseNumber(entry.unstaked_balance.toDisplay());
  const stakedParsed = parseNumber(entry.staked_balance.toDisplay());
  const unstakedNum = Number.isNaN(unstakedParsed) ? 0 : unstakedParsed;
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  if (unstakedNum > 0 && entry.can_withdraw) return DelegationStatus.Withdrawable;
  if (unstakedNum > 0) return DelegationStatus.Unstaking;
  if (stakedNum > 0) return DelegationStatus.Active;
  return null;
}

function SummaryItem({
  entry,
  onDelegate,
  onUndelegate,
  onUnclaimUnstaked,
}: {
  entry: DelegationSummaryEntry;
  onDelegate?: () => void;
  onUndelegate?: (validator: string) => void;
  onUnclaimUnstaked?: (validator: string) => void;
}) {
  const status = summaryStatus(entry);
  const stakedParsed = parseNumber(entry.staked_balance.toDisplay());
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  return (
    <li className="py-2" key={entry.validator}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm" title={entry.validator}>{truncateAccount(entry.validator)}</span>
        {status && (
          <span className="text-xs rounded bg-background px-2 py-0.5">{status}</span>
        )}
      </div>
      <div className="mt-1 text-xs text-secondary-text">
        <span>staked: {entry.staked_balance.toDisplay()}</span>
        <span className="mx-2 opacity-50">•</span>
        <span>unstaked: {entry.unstaked_balance.toDisplay()}</span>
        {entry.unstaked_at !== undefined && entry.current_epoch !== undefined && (
          <span className="ml-2 opacity-80">
            (epoch {entry.current_epoch} / unstaked at {entry.unstaked_at})
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="text-xs rounded border bg-surface hover:bg-surface/90 py-1 px-2 disabled:opacity-60"
          onClick={onDelegate}
          disabled={!onDelegate}
        >
          Delegate more
        </button>
        <button
          type="button"
          className="text-xs rounded border bg-surface hover:bg-surface/90 py-1 px-2 disabled:opacity-60"
          onClick={() => onUndelegate?.(entry.validator)}
          disabled={!onUndelegate || stakedNum <= 0}
        >
          Undelegate
        </button>
        <button
          type="button"
          className="text-xs rounded border bg-surface hover:bg-surface/90 py-1 px-2 disabled:opacity-60"
          onClick={() => onUnclaimUnstaked?.(entry.validator)}
          disabled={!onUnclaimUnstaked || status !== DelegationStatus.Withdrawable}
        >
          Claim
        </button>
      </div>
    </li>
  );
}

export function DelegationsSummary({
  entries,
  onDelegate,
  onUndelegate,
  onUnclaimUnstaked,
}: {
  entries: DelegationSummaryEntry[];
  onDelegate?: () => void;
  onUndelegate?: (validator: string) => void;
  onUnclaimUnstaked?: (validator: string) => void;
}) {
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <SummaryItem
          key={entry.validator}
          entry={entry}
          onDelegate={onDelegate}
          onUndelegate={onUndelegate}
          onUnclaimUnstaked={onUnclaimUnstaked}
        />
      ))}
    </ul>
  );
}
