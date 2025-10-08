"use client";

import React from "react";
import Link from "next/link";

const FLOW = [
  {
    title: "Create your vault from the wallet you control",
    summary: "Stake stays in place. The contract simply checks balances and permissions when actions are approved.",
  },
  {
    title: "Publish transparent terms for lenders",
    summary: "Choose the USDC amount, collateral ratio, and repayment window before broadcasting to the marketplace.",
  },
  {
    title: "Draw and repay against the same vault",
    summary: "Funding, draws, and repayments all route back through the vault for a clean on-chain audit trail.",
  },
];

const ASSURANCES = [
  {
    title: "Approvals gate every move",
    description: "There is no admin key. Deposits, draws, and repayments wait for your wallet signature.",
  },
  {
    title: "Immutable requests",
    description: "Once published, terms stay locked. Lenders decide with the exact data they will lend against.",
  },
  {
    title: "Observable health",
    description: "Track vault health, collateral balances, and repayment progress in real time from the dashboard.",
  },
];

export function Features() {
  return (
    <section className="mt-28">
      <div className="rounded-[32px] border border-white/12 bg-surface/85 p-8 shadow-[0_20px_72px_-48px_rgba(15,23,42,0.6)] backdrop-blur-sm sm:p-10">
        <div className="grid gap-y-12 gap-x-16 lg:grid-cols-[minmax(0,1.08fr),minmax(260px,0.92fr)]">
          <div>
            <h2 className="text-[clamp(1.45rem,2.3vw,2rem)] font-semibold text-foreground">How borrowing unfolds</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-secondary-text">
              Stay present for every important step while the protocol automates the rest.
            </p>
            <ol className="relative mt-8 space-y-8 before:absolute before:left-[13px] before:top-1 before:bottom-1 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-primary/15 before:to-transparent">
              {FLOW.map((item, index) => (
                <li key={item.title} className="relative rounded-3xl border border-transparent bg-background/60 p-5 pl-14 shadow-sm transition hover:border-primary/30 hover:bg-background/80">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text">{item.summary}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-[clamp(1.35rem,2vw,1.8rem)] font-semibold text-foreground">Guardrails for both sides</h2>
            <p className="mt-4 text-sm leading-relaxed text-secondary-text">
              Security and clarity build trust between borrower and lender—even in volatile markets.
            </p>
            <div className="mt-6 grid gap-4">
              {ASSURANCES.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-background/70 px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text">{item.description}</p>
                </div>
              ))}
            </div>
            <Link
              href="/docs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              Read how the protocol works
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.65rem]"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
