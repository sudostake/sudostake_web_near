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
    <Card className="p-4" role="region" aria-label={STRINGS.availableBalanceTitle} aria-busy={loading || undefined}>
      <div className="text-secondary-text text-xs uppercase tracking-wide">{STRINGS.availableBalanceTitle}</div>
      <div className="mt-1 text-2xl font-semibold flex items-baseline gap-1 min-w-0">
        <span className="truncate font-mono tabular-nums" title={`${display} ${symbol}`}>{display}</span>
        <span className="text-base text-secondary-text shrink-0">{symbol}</span>
      </div>
    </Card>
  );
}
