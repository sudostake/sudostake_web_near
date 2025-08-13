"use client";

import React from "react";

export interface AvailableBalanceCardProps {
  balance: string;
  symbol?: string;
  apy: number | null;
  loading: boolean;
}

export function AvailableBalanceCard({
  balance,
  symbol = "NEAR",
  apy,
  loading,
}: AvailableBalanceCardProps) {
  return (
    <section className="rounded bg-surface p-4">
      <div className="text-secondary-text text-xs">Available balance</div>
      <div className="mt-1 text-2xl font-semibold flex items-baseline gap-1 min-w-0">
        <span className="truncate" title={`${balance} ${symbol}`}>
          {loading ? "…" : balance}
        </span>
        <span className="text-base text-secondary-text shrink-0">{symbol}</span>
      </div>
      {apy !== null && (
        <div className="mt-2 text-xs text-secondary-text">APY ~ {apy}%</div>
      )}
    </section>
  );
}
