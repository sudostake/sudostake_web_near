"use client";

import React from "react";

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
    </svg>
  );
}
function IconFlash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 16V8M12 16V5m5 11V10" />
    </svg>
  );
}
function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Feature = { icon: React.ReactNode; title: string; body: string };

export function Features() {
  const items: Feature[] = [
    { icon: <IconShield />, title: "Non‑custodial", body: "You keep your keys. The contract enforces rules on‑chain." },
    { icon: <IconChart />, title: "Transparent terms", body: "See amounts, rates, and collateral upfront." },
    { icon: <IconFlash />, title: "Fast + low fees", body: "NEAR offers fast finality and low fees." },
    { icon: <IconCode />, title: "Open‑source", body: "Open code and transparent activity. No black boxes." },
  ];

  return (
    <section className="mt-12 md:mt-16">
      <h2 className="text-[clamp(1.25rem,2.1vw,1.75rem)] font-semibold">Why SudoStake</h2>
      <div className="mt-4 rounded-xl border bg-surface/50 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((f) => (
            <div key={f.title} className="rounded border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-secondary-text">{f.icon}</div>
                <div>
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-sm text-secondary-text mt-0.5 leading-relaxed">{f.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
