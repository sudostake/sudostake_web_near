"use client";
import React from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

import { Balance } from "@/utils/balance";
import { getActiveNetwork } from "@/utils/networks";
import { Card } from "@/app/components/ui/Card";

export function AccountSummary({
  near,
  usdc,
  loading,
}: {
  near: Balance;
  usdc: Balance;
  loading?: boolean;
}) {
  const { signedAccountId } = useWalletSelector();
  const network = getActiveNetwork();
  const usdcLabel = network === "mainnet" ? "USDC" : "USDC (Testnet)";

  return (
    <Card className="w-full md:max-w-2xl md:mx-auto p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold text-foreground">{signedAccountId}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-secondary-text">{near.symbol} Balance</div>
          <div className="text-xl font-medium min-h-7 flex items-baseline justify-center gap-1 min-w-0">
            {loading ? (
              <div className="h-7 w-32 mx-auto rounded bg-background animate-pulse" aria-hidden />
            ) : (
              <span title={near.toDisplay()}>
                {near.toDisplay()}
              </span>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-secondary-text">{usdcLabel}</div>
          <div className="text-xl font-medium min-h-7">
            {loading ? (
              <div className="h-7 w-32 mx-auto rounded bg-background animate-pulse" aria-hidden />
            ) : (
              <span>{usdc.toDisplay()}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
