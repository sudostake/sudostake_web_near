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
    <Card role="region" aria-label={STRINGS.availableBalanceTitle} aria-busy={loading || undefined}>
      <div className="text-xs uppercase tracking-wide text-secondary-text">{STRINGS.availableBalanceTitle}</div>
      <div className="mt-3 flex items-baseline gap-2 text-3xl font-semibold">
        <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
          {display}
        </span>
        <span className="text-sm text-secondary-text">{symbol}</span>
      </div>
    </Card>
  );
}
