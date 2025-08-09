"use client";
import React from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export function AccountSummary({
  near,
  usdc,
}: {
  near: string;
  usdc: string;
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
          <div className="text-xl font-medium">{near} Ⓝ</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-secondary-text">USDC (Testnet)</div>
          <div className="text-xl font-medium">${usdc}</div>
        </div>
      </div>
    </div>
  );
}
