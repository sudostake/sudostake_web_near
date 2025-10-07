"use client";

import React from "react";

export function Features() {
  const flow: string[] = [
    "Lock NEAR into a vault you control.",
    "Publish the request with USDC amount, collateral ratio, and repayment window.",
    "Lenders fund on-chain; you draw and repay from the same vault.",
  ];

  const assurances: string[] = [
    "Custody never leaves the borrower—approvals gate every move.",
    "Terms stay immutable once published, so lenders see the full picture.",
    "On-chain state provides an auditable trail for both sides.",
  ];

  return (
    <section className="mt-24">
      <div className="grid gap-y-10 gap-x-14 border-t pt-12 md:grid-cols-2">
        <div>
          <h2 className="text-[clamp(1.35rem,2vw,1.8rem)] font-semibold">Borrow flow</h2>
          <p className="mt-3 text-sm text-secondary-text">
            Three deliberate steps take you from collateral to cash without handing over keys.
          </p>
          <ol className="mt-4 space-y-4 text-sm text-secondary-text">
            {flow.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-xs font-semibold text-primary/90">{String(index + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-[clamp(1.35rem,2vw,1.8rem)] font-semibold">Why it’s credible</h2>
          <p className="mt-3 text-sm text-secondary-text">
            SudoStake keeps incentives aligned even when markets move.
          </p>
          <ul className="mt-4 space-y-4 text-sm text-secondary-text">
            {assurances.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
