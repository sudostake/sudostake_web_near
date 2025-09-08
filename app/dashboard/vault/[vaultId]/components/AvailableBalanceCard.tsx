"use client";

import React from "react";
import { Balance } from "@/utils/balance";

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
  return (
    <section className="rounded bg-surface p-4">
      <div className="text-secondary-text text-xs">Available balance</div>
      <div className="mt-1 text-2xl font-semibold flex items-baseline gap-1 min-w-0">
        <span className="truncate" title={`${balance.toDisplay()} ${symbol}`}>{balance.toDisplay()}</span>
        <span className="text-base text-secondary-text shrink-0">{symbol}</span>
      </div>
    </section>
  );
}
