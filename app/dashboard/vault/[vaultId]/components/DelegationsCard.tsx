"use client";

import React from "react";
// Use native BigInt for integer aggregation to avoid scientific notation issues
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { Summary } from "./Summary";
import { STRINGS } from "@/utils/strings";
import { NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";
import { formatMinimalTokenAmount, parseNumber, shortAmount } from "@/utils/format";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";

type Props = {
  loading: boolean;
  error: string | null;
  summary?: DelegationSummaryEntry[];
  availableBalance?: Balance | null;
  availableLoading?: boolean;
  refundsCount?: number;
  refundsLoading?: boolean;
  showClaimDisabledNote?: boolean;
};

/**
 * Renders the vault's delegation summary and controls.
 */
export function DelegationsCard({
  loading,
  error,
  summary,
  availableBalance,
  availableLoading,
  refundsCount,
  refundsLoading,
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
    <Card
      aria-labelledby="delegations-summary-heading"
      className="space-y-5 rounded-2xl border border-white/10 bg-surface px-4 py-5 sm:px-6 sm:py-6"
      role="region"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="delegations-summary-heading" className="text-lg font-semibold">{STRINGS.delegationsSummaryTitle}</h2>
          <p className="text-sm text-secondary-text">Monitor validator stakes and claimable balances.</p>
        </div>
        {(loading || refundsLoading) && (
          <span className="rounded-full border border-white/10 bg-background/80 px-3 py-1 text-xs text-secondary-text">
            Loading…
          </span>
        )}
      </div>

      {showClaimDisabledNote && (
        <div className="rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          {STRINGS.claimDisabledLiquidation}
        </div>
      )}

      {typeof refundsCount === "number" && refundsCount > 0 && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">{STRINGS.pendingRefunds}:</span> {refundsCount}. {STRINGS.refundsAffectDelegation}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200/60 bg-red-50/90 px-4 py-3 text-sm text-red-700" role="alert">
          Failed to load delegations
          <div className="mt-1 text-xs opacity-80">{error}</div>
        </div>
      )}

      <Summary
        loading={loading}
        entries={entriesForRender}
        availableBalance={availableBalance}
        availableLoading={availableLoading}
      />

      {Array.isArray(summary) && summary.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-background/70 px-4 py-3 text-xs text-secondary-text">
          <span>
            {STRINGS.totalStaked}: <span className="font-mono text-foreground">{shortAmount(stats.stakedDisplay, 6)}</span> {NATIVE_TOKEN}
          </span>
          <span>
            {STRINGS.totalUnstaked}: <span className="font-mono text-foreground">{shortAmount(stats.unstakedDisplay, 6)}</span> {NATIVE_TOKEN}
          </span>
          {stats.withdrawableCount > 0 && (
            <Badge variant="success">Ready to claim: {stats.withdrawableCount}</Badge>
          )}
        </div>
      )}
    </Card>
  );
}
