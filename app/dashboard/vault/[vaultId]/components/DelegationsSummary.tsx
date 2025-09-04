"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { useDelegationsActions } from "./DelegationsActionsContext";

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

function SummaryItem({ entry }: { entry: DelegationSummaryEntry }) {
  const { onDelegate, onUndelegate, onUnclaimUnstaked } = useDelegationsActions();
  const status = summaryStatus(entry);
  const stakedParsed = parseNumber(entry.staked_balance.toDisplay());
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  const canUndelegate = Boolean(onUndelegate) && stakedNum > 0;
  const canClaim = Boolean(onUnclaimUnstaked) && status === DelegationStatus.Withdrawable;
  const canDelegate = Boolean(onDelegate);

  return (
    <li className="py-3" key={entry.validator}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm truncate" title={entry.validator}>
              {truncateAccount(entry.validator)}
            </span>
            {status && (
              <span className="text-[10px] uppercase tracking-wide rounded bg-background px-2 py-0.5">
                {status}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-secondary-text flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-baseline gap-1">
              <span className="opacity-70">staked</span>
              <span className="font-mono">{entry.staked_balance.toDisplay()}</span>
            </span>
            <span className="inline-flex items-baseline gap-1">
              <span className="opacity-70">unstaked</span>
              <span className="font-mono">{entry.unstaked_balance.toDisplay()}</span>
            </span>
          </div>
          {entry.unstaked_at !== undefined && entry.current_epoch !== undefined && (
            <div className="mt-1 text-[11px] text-secondary-text opacity-80">
              epoch {entry.current_epoch} • unstaked at {entry.unstaked_at}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {canClaim && (
            <button
              type="button"
              aria-label={`Claim unstaked for ${entry.validator}`}
              className="text-xs rounded bg-primary text-primary-text py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => onUnclaimUnstaked?.(entry.validator)}
              disabled={!canClaim}
            >
              Claim
            </button>
          )}
          <button
            type="button"
            aria-label={`Delegate to ${entry.validator}`}
            className={[
              "text-xs rounded py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed",
              canClaim ? "border bg-surface hover:bg-surface/90" : "bg-primary text-primary-text",
            ].join(" ")}
            onClick={() => onDelegate?.(entry.validator)}
            disabled={!canDelegate}
          >
            Delegate
          </button>
          <button
            type="button"
            aria-label={`Undelegate from ${entry.validator}`}
            className="text-xs rounded border bg-surface hover:bg-surface/90 py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onUndelegate?.(entry.validator)}
            disabled={!canUndelegate}
          >
            Undelegate
          </button>
        </div>
      </div>
    </li>
  );
}

export function DelegationsSummary({ entries }: { entries: DelegationSummaryEntry[] }) {
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <SummaryItem key={entry.validator} entry={entry} />
      ))}
    </ul>
  );
}
