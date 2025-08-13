"use client";
import React from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export function AccountSummary({
  near,
  usdc,
  loading,
}: {
  near: string;
  usdc: string;
  loading?: boolean;
}) {
  const { signedAccountId } = useWalletSelector();

  return (
    <div className="w-full md:max-w-2xl md:mx-auto bg-surface p-4 rounded-lg shadow">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold text-primary">{signedAccountId}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-secondary-text">NEAR Balance</div>
          <div className="text-xl font-medium min-h-7 flex items-baseline justify-center gap-1 min-w-0">
            {loading || near === "—" ? (
              <div className="h-7 w-32 mx-auto rounded bg-background animate-pulse" aria-hidden />
            ) : (
              <>
                <span className="truncate" title={`${near} NEAR`}>
                  {near}
                </span>
                <span className="text-base text-secondary-text shrink-0">Ⓝ</span>
              </>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-secondary-text">USDC (Testnet)</div>
          <div className="text-xl font-medium min-h-7">
            {loading || usdc === "—" ? (
              <div className="h-7 w-32 mx-auto rounded bg-background animate-pulse" aria-hidden />
            ) : (
              <span>${usdc}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
