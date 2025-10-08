"use client";

import React from "react";
import Link from "next/link";

const FLOW = [
  {
    title: "Create a vault that stays under your keys",
    summary: "Mint a vault directly from your wallet. Permissions stay scoped so only you can approve changes.",
  },
  {
    title: "Publish a request with clear collateral and terms",
    summary: "Decide the USDC amount, target health buffer, interest, and duration—everything the lender needs to evaluate risk.",
  },
  {
    title: "Draw funds and repay from the same contract",
    summary: "Drawdowns, top-ups, and repayments flow through the vault, keeping the on-chain record traceable from start to finish.",
  },
];

const ASSURANCES = [
  {
    title: "Approvals protect every action",
    description: "There’s no backdoor. Transactions pause at your wallet until you review and sign.",
  },
  {
    title: "Requests can’t shift mid-loan",
    description: "Once published, loan terms are locked. Lenders never have to guess which parameters will change next.",
  },
  {
    title: "Live health monitoring",
    description: "Dashboards show collateral, outstanding principal, and repayment status so both sides know when to act.",
  },
];

export function Features() {
  return (
    <section className="mt-28">
      <div className="rounded-[32px] border border-white/12 bg-surface/90 p-8 shadow-[0_20px_72px_-48px_rgba(15,23,42,0.6)] backdrop-blur-sm sm:p-10">
        <div className="grid gap-y-12 gap-x-16 lg:grid-cols-[minmax(0,1.08fr),minmax(260px,0.92fr)]">
          <div>
            <h2 className="text-[clamp(1.45rem,2.3vw,2rem)] font-semibold text-foreground">How borrowing unfolds</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-secondary-text">
              Launch a request without losing sovereignty over your vault. SudoStake handles the protocol details while you
              stay present for the decisions that matter.
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
              Purpose-built guardrails keep incentives aligned even when markets move fast.
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
              Explore the protocol in detail
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
