"use client";

import React from "react";

type Wallet = { name: string; color: string; letter?: string };

const WALLETS: Wallet[] = [
  { name: "Bitte", color: "bg-blue-600" },
  { name: "Meteor", color: "bg-purple-600" },
  { name: "MyNearWallet", color: "bg-emerald-600" },
  { name: "Nightly", color: "bg-slate-700" },
  { name: "Ledger", color: "bg-gray-500" },
];

export function WalletBadges() {
  return (
    <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {WALLETS.map((w) => (
        <li key={w.name} className="flex items-center gap-3 rounded border bg-background/60 p-3">
          <span
            aria-hidden
            className={`inline-flex h-7 w-7 items-center justify-center rounded ${w.color} text-white font-medium`}
          >
            {(w.letter ?? w.name[0]).toUpperCase()}
          </span>
          <span className="text-sm">{w.name}</span>
        </li>
      ))}
    </ul>
  );
}

