"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";
import { Balance } from "@/utils/balance";
import { STRINGS } from "@/utils/strings";
import { shortAmount } from "@/utils/format";

export interface AvailableBalanceCardProps {
  /** Balance abstraction (raw + display + symbol) */
  balance: Balance;
  /** Loading state for balance fetch */
  loading: boolean;
  actions?: React.ReactNode;
}

export function AvailableBalanceCard({
  balance,
  loading,
  actions,
}: AvailableBalanceCardProps) {
  const symbol = balance.symbol;
  const display = loading ? "Loading..." : balance.toDisplay();
  const compactDisplay = loading ? "Loading..." : shortAmount(balance.toDisplay(), 6);

  return (
    <Card
      role="region"
      aria-label={STRINGS.availableBalanceTitle}
      aria-busy={loading || undefined}
      className="surface-card space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 sm:px-5"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {STRINGS.availableBalanceTitle}
      </div>
      <div className="flex items-baseline gap-2 text-[clamp(2rem,4vw,2.6rem)] font-semibold text-foreground">
        {loading ? (
          <span className="inline-flex h-8 w-28 animate-pulse rounded-full bg-foreground/10" aria-hidden="true" />
        ) : (
          <span className="break-all font-mono tabular-nums" title={`${display} ${symbol}`}>
            {compactDisplay}
          </span>
        )}
        <span className="text-sm text-secondary-text">{symbol}</span>
      </div>
      {actions && (
        <div className="pt-2">
          {actions}
        </div>
      )}
    </Card>
  );
}
