"use client";

import React from "react";

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-8 w-8 rounded bg-foreground/10 flex items-center justify-center text-sm font-semibold">
      {children}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      title: "Create a vault",
      body: "Lock NEAR as collateral in a contract you control.",
      icon: "1",
    },
    {
      title: "Request liquidity",
      body: "Choose the USDC amount and terms. Lenders can fund.",
      icon: "2",
    },
    {
      title: "Repay or liquidate",
      body: "Repay to unlock your collateral. Otherwise the contract settles claims.",
      icon: "3",
    },
  ];

  return (
    <section id="how-it-works" className="mt-12 md:mt-16">
      <h2 className="text-[clamp(1.25rem,2.1vw,1.75rem)] font-semibold">How it works</h2>
      <div className="mt-4 rounded-xl border bg-surface/50 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="flex gap-3 rounded border bg-surface p-4">
              <StepIcon>{s.icon}</StepIcon>
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-secondary-text leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-secondary-text">
          Non‑custodial by design. You approve every transaction; the contract enforces rules on‑chain.
        </div>
      </div>
    </section>
  );
}
