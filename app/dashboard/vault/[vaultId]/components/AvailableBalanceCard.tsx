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
      className="rounded-[28px] border-white/12 bg-gradient-to-br from-surface/95 to-surface/85 px-6 py-6 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.65)]"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-primary/80">{STRINGS.availableBalanceTitle}</div>
      <div className="mt-4 flex items-baseline gap-2 text-[clamp(2.2rem,3vw,2.6rem)] font-semibold text-foreground">
        <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
          {display}
        </span>
        <span className="text-sm text-secondary-text/90">{symbol}</span>
      </div>
    </Card>
  );
}
