"use client";
import React from "react";

export function AccountSummary({
  near,
  usdc,
}: {
  near: string;
  usdc: string;
}) {
  return (
  <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg shadow">
      <div className="text-center">
        <div className="text-sm text-secondary-text">NEAR Balance</div>
        <div className="text-xl font-medium">{near} Ⓝ</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-secondary-text">USDC (Testnet)</div>
        <div className="text-xl font-medium">${usdc}</div>
      </div>
    </div>
  );
}
