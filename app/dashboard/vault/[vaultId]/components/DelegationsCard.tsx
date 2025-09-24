"use client";

import React from "react";
// Use native BigInt for integer aggregation to avoid scientific notation issues
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { Summary } from "./Summary";
import { STRINGS } from "@/utils/strings";
import { NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";
import { formatMinimalTokenAmount, parseNumber, shortAmount } from "@/utils/format";

type Props = {
  loading: boolean;
  error: string | null;
  summary?: DelegationSummaryEntry[];
  refetch: () => void;
  availableBalance?: Balance | null;
  availableLoading?: boolean;
  refundsCount?: number;
  refundsLoading?: boolean;
  onRefreshRefunds?: () => void;
  showClaimDisabledNote?: boolean;
};

/**
 * Renders the vault's delegation summary and controls.
 */
export function DelegationsCard({
  loading,
  error,
  summary,
  refetch,
  availableBalance,
  availableLoading,
  refundsCount,
  refundsLoading,
  onRefreshRefunds,
  showClaimDisabledNote,
}: Props) {
  // With max 2 validators, keep UI minimal; no filters/inputs.

  // Compute lightweight stats for footer
  const stats = React.useMemo(() => {
    const entries = Array.isArray(summary) ? summary : [];
    let staked = BigInt(0);
    let unstaked = BigInt(0);
    let withdrawableCount = 0;
    for (const e of entries) {
      try {
        // Sum raw minimal-unit values exactly using BigInt
        const s = BigInt(e.staked_balance.minimal || "0");
        const u = BigInt(e.unstaked_balance.minimal || "0");
        staked += s;
        unstaked += u;
      } catch {
        // Ignore malformed values, continue with others
      }
      try {
        if (e.can_withdraw) {
          const un2 = parseNumber(e.unstaked_balance.toDisplay());
          if (Number.isFinite(un2) && un2 > 0) withdrawableCount += 1;
        }
      } catch {
        // Ignore parse errors for withdrawable count
      }
    }
    const stakedDisplay = formatMinimalTokenAmount(staked.toString(), NATIVE_DECIMALS);
    const unstakedDisplay = formatMinimalTokenAmount(unstaked.toString(), NATIVE_DECIMALS);
    return { stakedDisplay, unstakedDisplay, withdrawableCount };
  }, [summary]);

  // Minimal default ordering for clarity (withdrawable -> unstaking -> active)
  const entriesForRender = React.useMemo(() => {
    const entries = Array.isArray(summary) ? [...summary] : summary;
    if (!Array.isArray(entries)) return entries;
    const smartWeight = (e: DelegationSummaryEntry): number => {
      const un = parseNumber(e.unstaked_balance.toDisplay());
      const st = parseNumber(e.staked_balance.toDisplay());
      const hasUn = Number.isFinite(un) && un > 0;
      const hasSt = Number.isFinite(st) && st > 0;
      if (hasUn && e.can_withdraw) return 0;
      if (hasUn) return 1;
      if (hasSt) return 2;
      return 3;
    };
    entries.sort((a, b) => {
      const w = smartWeight(a) - smartWeight(b);
      if (w !== 0) return w;
      const aTot = (parseNumber(a.staked_balance.toDisplay()) || 0) + (parseNumber(a.unstaked_balance.toDisplay()) || 0);
      const bTot = (parseNumber(b.staked_balance.toDisplay()) || 0) + (parseNumber(b.unstaked_balance.toDisplay()) || 0);
      if (bTot !== aTot) return bTot - aTot;
      return a.validator.localeCompare(b.validator);
    });
    return entries;
  }, [summary]);

  return (
    <section className="rounded border border-foreground/20 bg-background/80 text-foreground dark:bg-background/60" aria-labelledby="delegations-summary-heading">
      <header className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
        <h2 id="delegations-summary-heading" className="text-base font-medium">{STRINGS.delegationsSummaryTitle}</h2>
        <div className="text-xs text-secondary-text">
          {loading || refundsLoading ? (
            "Loading…"
          ) : (
            <button
              className="underline"
              onClick={() => {
                refetch();
                onRefreshRefunds?.();
              }}
            >
              Refresh
            </button>
          )}
        </div>
      </header>

      {showClaimDisabledNote && (
        <div className="px-4 pt-3">
          <div className="rounded border border-red-300/40 bg-red-50 text-red-900 p-2 text-sm dark:bg-red-900/30 dark:text-red-100 dark:border-red-500/30">
            {STRINGS.claimDisabledLiquidation}
          </div>
        </div>
      )}

      {typeof refundsCount === "number" && refundsCount > 0 && (
        <div className="px-4 pt-3">
          <div className="rounded border border-amber-300/40 bg-amber-50 text-amber-900 p-2 text-sm dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-500/30">
            <span className="font-medium">{STRINGS.pendingRefunds}:</span> {refundsCount}. {STRINGS.refundsAffectDelegation}
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm text-red-500" role="alert">
          Failed to load delegations
          <div className="text-xs opacity-80 mt-1">{error}</div>
        </div>
      )}

      <Summary
        loading={loading}
        entries={entriesForRender}
        availableBalance={availableBalance}
        availableLoading={availableLoading}
      />

      {/* Totals footer */}
      {Array.isArray(summary) && summary.length > 0 && (
        <footer className="border-t border-foreground/10 mt-2">
          <div className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-text">
              <div>
                {STRINGS.totalStaked}: <span className="font-mono text-foreground">{shortAmount(stats.stakedDisplay, 6)}</span> {NATIVE_TOKEN}
              </div>
              <div>
                {STRINGS.totalUnstaked}: <span className="font-mono text-foreground">{shortAmount(stats.unstakedDisplay, 6)}</span> {NATIVE_TOKEN}
              </div>
              {stats.withdrawableCount > 0 && (
                <div className="rounded bg-emerald-100/70 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100 px-1.5 py-0.5">
                  Ready to claim: <span className="font-medium">{stats.withdrawableCount}</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}

    </section>
  );
}
