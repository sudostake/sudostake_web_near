"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Balance } from "@/utils/balance";
import { STRINGS } from "@/utils/strings";
import { parseNumber, shortAmount } from "@/utils/format";
import { Badge } from "@/app/components/ui/Badge";
import type { ViewerRole } from "@/hooks/useViewerRole";

export interface AvailableBalanceCardProps {
  /** Balance abstraction (raw + display + symbol) */
  balance: Balance;
  /** Loading state for balance fetch */
  loading: boolean;
  contractBalance?: string;
  state?: "idle" | "pending" | "active" | null;
  liquidationActive?: boolean;
  refundsCount?: number;
  role?: ViewerRole;
  actions?: React.ReactNode;
}

export function AvailableBalanceCard({
  balance,
  loading,
  contractBalance,
  state,
  liquidationActive = false,
  refundsCount = 0,
  role = "guest",
  actions,
}: AvailableBalanceCardProps) {
  const symbol = balance.symbol;
  const display = loading ? "Loading..." : balance.toDisplay();
  const compactDisplay = loading ? "Loading..." : shortAmount(balance.toDisplay(), 6);
  const numericBalance = parseNumber(balance.toDisplay());
  const contractBalanceNumeric = parseNumber(contractBalance ?? "");
  const compactContractBalance =
    contractBalance && contractBalance !== "—" ? shortAmount(contractBalance, 6) : "—";
  const hasFunds = Number.isFinite(numericBalance) && numericBalance > 0;
  const vaultHasOtherCapital = Number.isFinite(contractBalanceNumeric) && contractBalanceNumeric > 0;
  const availabilityLabel = loading
    ? "Syncing"
    : hasFunds
    ? "Liquid"
    : vaultHasOtherCapital
    ? "Illiquid"
    : "Empty";
  const modeLabel = loading
    ? "Syncing"
    : liquidationActive
    ? "Liquidation"
    : refundsCount > 0
    ? "Refunds"
    : state === "active"
    ? "Loan"
    : state === "pending"
    ? "Request"
    : role === "owner"
    ? "Owner"
    : "View";
  const badgeLabel = loading
    ? "Syncing"
    : hasFunds
    ? "Liquid"
    : vaultHasOtherCapital
    ? "Illiquid"
    : "Empty";
  const badgeVariant = loading ? "neutral" : hasFunds ? "success" : vaultHasOtherCapital ? "warn" : "info";
  return (
    <Card
      role="region"
      aria-label={STRINGS.availableBalanceTitle}
      aria-busy={loading || undefined}
      className="surface-card space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {STRINGS.availableBalanceTitle}
        </span>
        <Badge variant={badgeVariant}>
          {badgeLabel}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2 text-[clamp(1.85rem,3.5vw,2.2rem)] font-semibold text-foreground">
        {loading ? (
          <span className="inline-flex h-7 w-24 animate-pulse rounded-full bg-foreground/10" aria-hidden="true" />
        ) : (
          <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
            {compactDisplay}
          </span>
        )}
        <span className="text-sm text-secondary-text">{symbol}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <MetaCell label="Contract" value={compactContractBalance === "—" ? "—" : `${compactContractBalance} ${symbol}`} />
        <MetaCell label="Status" value={availabilityLabel} />
        <MetaCell label="Mode" value={modeLabel} />
      </div>
      {actions && (
        <div className="space-y-3 border-t border-[color:var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Actions</p>
          {actions}
        </div>
      )}
    </Card>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
