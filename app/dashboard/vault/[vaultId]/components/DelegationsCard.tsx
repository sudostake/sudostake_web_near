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
  const shouldShowSummary = !error || (Array.isArray(summary) && summary.length > 0);
  const statusBadges = [
    (loading || refundsLoading) ? <Badge key="sync" variant="neutral">Syncing</Badge> : null,
    showClaimDisabledNote ? <Badge key="claims-locked" variant="danger">Claims locked</Badge> : null,
    typeof refundsCount === "number" && refundsCount > 0 ? (
      <Badge key="refunds" variant="warn">{refundsCount} refund{refundsCount === 1 ? "" : "s"}</Badge>
    ) : null,
    error ? <Badge key="error" variant="warn">Data unavailable</Badge> : null,
  ].filter(Boolean);

  return (
    <Card
      aria-labelledby="delegations-summary-heading"
      className="surface-card space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5"
      role="region"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="delegations-summary-heading" className="text-lg font-semibold">Delegations</h2>
        <div className="flex flex-wrap gap-2">{statusBadges}</div>
      </div>

      {error && (
        <div
          className="rounded-2xl border border-amber-200/60 bg-amber-50/90 px-4 py-3 text-xs font-medium text-amber-800"
          role="alert"
          title={error}
        >
          Delegation data unavailable
        </div>
      )}

      {shouldShowSummary ? (
        <Summary
          loading={loading}
          entries={entriesForRender}
          availableBalance={availableBalance}
          availableLoading={availableLoading}
        />
      ) : null}

      {Array.isArray(summary) && summary.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          <StatCell label={STRINGS.totalStaked} value={`${shortAmount(stats.stakedDisplay, 6)} ${NATIVE_TOKEN}`} />
          <StatCell label={STRINGS.totalUnstaked} value={`${shortAmount(stats.unstakedDisplay, 6)} ${NATIVE_TOKEN}`} />
          <StatCell label="Ready" value={String(stats.withdrawableCount)} tone={stats.withdrawableCount > 0 ? "success" : "neutral"} />
        </div>
      )}
    </Card>
  );
}

function StatCell({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-3 py-3",
        tone === "success"
          ? "border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_10%,var(--surface)),var(--surface))]"
          : "border-[color:var(--border)] bg-[color:var(--surface-muted)]",
      ].join(" ")}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</p>
      <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
    </div>
  );
}
