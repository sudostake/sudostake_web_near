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
  const display = loading ? "Loading…" : balance.toDisplay();
  return (
    <Card
      role="region"
      aria-label={STRINGS.availableBalanceTitle}
      aria-busy={loading || undefined}
      className="space-y-3 rounded-2xl border border-white/10 bg-surface px-4 py-5 sm:px-6 sm:py-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary-text/80">
          {STRINGS.availableBalanceTitle}
        </span>
        {loading && <span className="text-[11px] text-secondary-text/70">Updating…</span>}
      </div>
      <div className="flex items-baseline gap-2 text-[clamp(2rem,4vw,2.3rem)] font-semibold text-foreground">
        {loading ? (
          <span className="inline-flex h-7 w-24 animate-pulse rounded-full bg-foreground/10" aria-hidden="true" />
        ) : (
          <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
            {display}
          </span>
        )}
        <span className="text-sm text-secondary-text/80">{symbol}</span>
      </div>
    </Card>
  );
}
