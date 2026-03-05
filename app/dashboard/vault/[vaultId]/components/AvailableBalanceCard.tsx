"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Balance } from "@/utils/balance";
import { STRINGS } from "@/utils/strings";

export interface AvailableBalanceCardProps {
  /** Balance abstraction (raw + display + symbol) */
  balance: Balance;
  /** Loading state for balance fetch */
  loading: boolean;
}

export function AvailableBalanceCard({
  balance,
  loading,
}: AvailableBalanceCardProps) {
  const symbol = balance.symbol;
  const display = loading ? "Loading..." : balance.toDisplay();
  return (
    <Card
      role="region"
      aria-label={STRINGS.availableBalanceTitle}
      aria-busy={loading || undefined}
      className="surface-card space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {STRINGS.availableBalanceTitle}
        </span>
        {loading && <span className="text-sm text-secondary-text">Updating...</span>}
      </div>
      <div className="flex items-baseline gap-2 text-[clamp(1.85rem,3.5vw,2.2rem)] font-semibold text-foreground">
        {loading ? (
          <span className="inline-flex h-7 w-24 animate-pulse rounded-full bg-foreground/10" aria-hidden="true" />
        ) : (
          <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
            {display}
          </span>
        )}
        <span className="text-sm text-secondary-text">{symbol}</span>
      </div>
      <p className="text-xs text-secondary-text">Ready to delegate, withdraw, or use for vault-level actions.</p>
    </Card>
  );
}
