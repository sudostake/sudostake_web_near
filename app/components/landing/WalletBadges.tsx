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
    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {WALLETS.map((w) => (
        <li key={w.name} className="flex items-center gap-3 rounded-full border bg-foreground/5 px-3 py-2">
          <span
            aria-hidden="true"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${w.color} text-white font-semibold`}
          >
            {(w.letter ?? w.name[0]).toUpperCase()}
          </span>
          <span className="text-sm">{w.name}</span>
        </li>
      ))}
    </ul>
  );
}
