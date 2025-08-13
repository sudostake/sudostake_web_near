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
      <div className="mt-1 text-2xl font-semibold">
        {loading ? "…" : balance} {symbol}
      </div>
      {apy !== null && (
        <div className="mt-2 text-xs text-secondary-text">APY ~ {apy}%</div>
      )}
    </section>
  );
}
