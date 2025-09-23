"use client";

import React from "react";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { useDelegationsActions } from "./DelegationsActionsContext";
import { shortAmount } from "@/utils/format";
import { analyzeUnstakeEntry } from "@/utils/epochs";
import { EpochDetails } from "./EpochDetails";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { explorerAccountUrl, getActiveNetwork } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";

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
  const base = "text-[10px] uppercase tracking-wide rounded px-2 py-0.5 ring-1 ring-transparent";
  switch (status) {
    case DelegationStatus.Withdrawable:
      return `${base} bg-emerald-100 text-emerald-800 ring-emerald-300/50 dark:bg-emerald-800/50 dark:text-emerald-100 dark:ring-emerald-500/40`;
    case DelegationStatus.Unstaking:
      return `${base} bg-amber-100 text-amber-800 ring-amber-300/50 dark:bg-amber-800/50 dark:text-amber-100 dark:ring-amber-500/40`;
    case DelegationStatus.Active:
      return `${base} bg-blue-100 text-blue-800 ring-blue-300/50 dark:bg-blue-800/50 dark:text-blue-100 dark:ring-blue-500/40`;
    default:
      return `${base} bg-background`;
  }
}

function statusLabel(status: DelegationStatus | null): string {
  switch (status) {
    case DelegationStatus.Withdrawable:
      return STRINGS.statusWithdrawable;
    case DelegationStatus.Unstaking:
      return STRINGS.statusUnstaking;
    case DelegationStatus.Active:
      return STRINGS.statusActive;
    default:
      return "";
  }
}

// shortAmount moved to utils/format

function accentBarClass(status: DelegationStatus | null): string {
  const base = "absolute left-0 top-0 bottom-0 w-1.5 group-hover:w-2 transition-all duration-200 rounded-l"; // ~6–8px
  switch (status) {
    case DelegationStatus.Withdrawable:
      return `${base} bg-emerald-300/80 dark:bg-emerald-300/50`;
    case DelegationStatus.Unstaking:
      return `${base} bg-amber-300/80 dark:bg-amber-300/50`;
    case DelegationStatus.Active:
      return `${base} bg-blue-300/80 dark:bg-blue-300/50`;
    default:
      return `${base} bg-foreground/10`;
  }
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
    <li
      className="group relative overflow-hidden rounded border border-foreground/10 bg-background/70 shadow-sm hover:bg-background/80 transition-colors p-3 dark:bg-background/60 dark:shadow-none"
      key={entry.validator}
    >
      <div className={accentBarClass(status)} aria-hidden />
      <div className="min-w-0">
        {/* Validator + status */}
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={explorerAccountUrl(getActiveNetwork(), entry.validator)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm underline truncate"
            title={entry.validator}
          >
            {truncateAccount(entry.validator)}
          </a>
          <CopyButton value={entry.validator} title="Copy validator" />
          {status && (
            <span
              className={
                statusPillClass(status) +
                (status === DelegationStatus.Withdrawable ? " cursor-help" : "")
              }
              title={
                status === DelegationStatus.Withdrawable
                  ? `${entry.unstaked_balance.minimal} yoctoNEAR`
                  : undefined
              }
            >
              {statusLabel(status)}
            </span>
          )}
        </div>
        {showMore && entry.unstaked_at !== undefined && entry.current_epoch !== undefined && (
          <div className="mt-1 text-xs text-secondary-text opacity-80">
            current epoch {entry.current_epoch} • unstaked epoch {entry.unstaked_at}
          </div>
        )}

        {/* Balances */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.stakedLabelUI}</div>
            <div className="font-mono text-sm break-all" title={entry.staked_balance.toDisplay()}>
              {shortAmount(entry.staked_balance.toDisplay(), 6)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.unstakedLabelUI}</div>
            <div className="font-mono text-sm break-all" title={entry.unstaked_balance.toDisplay()}>
              {shortAmount(entry.unstaked_balance.toDisplay(), 6)}
            </div>
          </div>
        </div>
      </div>
      {/* Optional per-entry more details */}
      {epochDetails && (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs underline text-primary"
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore ? STRINGS.hideDetails : STRINGS.showDetails}
          </button>
          {showMore && (
            <div className="mt-2">
              <EpochDetails
                unlockEpoch={epochDetails.unlockEpoch}
                remaining={epochDetails.remaining}
                availableNow={entry.can_withdraw}
                unstakeEpoch={entry.unstaked_at}
              />
            </div>
          )}
        </div>
      )}
      {/* Actions footer: show only when any action handlers are available (e.g., owner view). */}
      {Boolean(onDelegate || onUndelegate || onUnclaimUnstaked) && (
        <div className="mt-3 -mx-3 border-t border-foreground/10 bg-background/60 dark:bg-background/50">
          <div className="px-3 py-2 flex flex-wrap gap-2 justify-start sm:justify-end">
            {canClaim && (
              <button
                type="button"
                aria-label={`Claim unstaked for ${entry.validator}`}
                className="text-xs rounded bg-primary text-primary-text py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/40"
                onClick={() => onUnclaimUnstaked?.(entry.validator)}
                disabled={!canClaim}
              >
                {STRINGS.claimAction}
              </button>
            )}
            <button
              type="button"
              aria-label={`Delegate to ${entry.validator}`}
              className={[
                "text-xs rounded py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/40",
                canClaim ? "border bg-surface hover:bg-surface/90" : "bg-primary text-primary-text",
              ].join(" ")}
              onClick={() => onDelegate?.(entry.validator)}
              disabled={!canDelegate}
            >
              {STRINGS.delegateAction}
            </button>
            <button
              type="button"
              aria-label={`Undelegate from ${entry.validator}`}
              className="text-xs rounded border bg-surface hover:bg-surface/90 py-1 px-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary/40"
              onClick={() => onUndelegate?.(entry.validator)}
              disabled={!canUndelegate}
            >
              {STRINGS.undelegateAction}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function DelegationsSummary({ entries }: { entries: DelegationSummaryEntry[] }) {
  return (
    <div className="space-y-2" aria-label="Delegations summary">
      <ul className="space-y-2">
        {entries.map((entry) => (
          <SummaryItem key={entry.validator} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
