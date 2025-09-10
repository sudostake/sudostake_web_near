"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { useDelegationsActions } from "./DelegationsActionsContext";
import { analyzeUnstakeEntry } from "@/utils/epochs";
import { EpochDetails } from "./EpochDetails";

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

function statusPillClass(status: DelegationStatus | null): string {
  const base = "text-[10px] uppercase tracking-wide rounded px-2 py-0.5";
  switch (status) {
    case DelegationStatus.Withdrawable:
      return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200`;
    case DelegationStatus.Unstaking:
      return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200`;
    case DelegationStatus.Active:
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200`;
    default:
      return `${base} bg-background`;
  }
}

function statusLabel(status: DelegationStatus | null): string {
  switch (status) {
    case DelegationStatus.Withdrawable:
      return "Ready to withdraw";
    case DelegationStatus.Unstaking:
      return "Unstaking";
    case DelegationStatus.Active:
      return "Active";
    default:
      return "";
  }
}

function shortAmount(display: string, maxDecimals = 6): string {
  // Expecting a decimal string, potentially very long. Trim fractional part for legibility.
  const [intPart, fracPart] = display.split(".");
  if (!fracPart) return intPart;
  const trimmed = fracPart.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmed.length > 0 ? `${intPart}.${trimmed}` : intPart;
}

function SummaryItem({ entry }: { entry: DelegationSummaryEntry }) {
  const { onDelegate, onUndelegate, onUnclaimUnstaked } = useDelegationsActions();
  const status = summaryStatus(entry);
  const stakedParsed = parseNumber(entry.staked_balance.toDisplay());
  const stakedNum = Number.isNaN(stakedParsed) ? 0 : stakedParsed;
  const canUndelegate = Boolean(onUndelegate) && stakedNum > 0;
  const canClaim = Boolean(onUnclaimUnstaked) && status === DelegationStatus.Withdrawable;
  const canDelegate = Boolean(onDelegate);

  const [showMore, setShowMore] = React.useState(false);

  // Compute epoch info for ETA/details when available
  const epochDetails = React.useMemo(() => {
    if (entry.unstaked_at === undefined) return null;
    const current = entry.current_epoch ?? null;
    const info = analyzeUnstakeEntry(entry.unstaked_at, current);
    return info;
  }, [entry.unstaked_at, entry.current_epoch]);

  return (
    <li className="py-3" key={entry.validator}>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Validator + status */}
        <div className="sm:col-span-6 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm truncate" title={entry.validator}>
              {truncateAccount(entry.validator)}
            </span>
            {status && <span className={statusPillClass(status)}>{statusLabel(status)}</span>}
          </div>
          {entry.unstaked_at !== undefined && entry.current_epoch !== undefined && (
            <div className="mt-1 text-[11px] text-secondary-text opacity-80">
              current epoch {entry.current_epoch} • unstaked epoch {entry.unstaked_at}
            </div>
          )}

          {/* Mobile-only balances */}
          <div className="mt-2 grid grid-cols-2 gap-3 sm:hidden">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-secondary-text">Staked</div>
              <div className="font-mono text-sm break-all" title={entry.staked_balance.toDisplay()}>
                {shortAmount(entry.staked_balance.toDisplay(), 4)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-secondary-text">Unstaked</div>
              <div className="font-mono text-sm break-all" title={entry.unstaked_balance.toDisplay()}>
                {shortAmount(entry.unstaked_balance.toDisplay(), 4)}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop balances */}
        <div className="hidden sm:block sm:col-span-3">
          <div className="font-mono text-sm text-right tabular-nums" title={entry.staked_balance.toDisplay()}>
            {shortAmount(entry.staked_balance.toDisplay(), 6)}
          </div>
        </div>
        <div className="hidden sm:block sm:col-span-3">
          <div className="font-mono text-sm text-right tabular-nums" title={entry.unstaked_balance.toDisplay()}>
            {shortAmount(entry.unstaked_balance.toDisplay(), 6)}
          </div>
        </div>

      </div>
      {/* Optional per-entry more details */}
      {epochDetails && (
        <div className="mt-2">
          <button
            type="button"
            className="text-[11px] underline text-primary"
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore ? "Hide details" : "Show more"}
          </button>
          {showMore && (
            <div className="mt-2">
              <EpochDetails
                unlockEpoch={epochDetails.unlockEpoch}
                remaining={epochDetails.remaining}
                currentEpoch={entry.current_epoch ?? null}
                availableNow={entry.can_withdraw}
              />
            </div>
          )}
        </div>
      )}
      {/* Actions row: full width at bottom */}
      <div className="mt-2 pt-2 border-t border-foreground/10">
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
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
    <div className="space-y-1">
      <div className="hidden sm:grid grid-cols-12 gap-6 text-[11px] uppercase tracking-wide text-secondary-text px-1">
        <div className="col-span-6">Validator</div>
        <div className="col-span-3 text-right">Staked</div>
        <div className="col-span-3 text-right">Unstaked</div>
      </div>
      <ul className="divide-y">
        {entries.map((entry) => (
          <SummaryItem key={entry.validator} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
