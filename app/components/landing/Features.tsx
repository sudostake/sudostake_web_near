"use client";

import React from "react";
import Link from "next/link";

const FLOW = [
  {
    title: "Spin up a vault under your keys",
    summary: "Mint a borrowing vault straight from your wallet. Only your approved signers can authorize changes.",
  },
  {
    title: "Publish terms lenders can price",
    summary: "Share collateral ratios, rates, buffers, and timelines so risk teams know the guardrails before committing capital.",
  },
  {
    title: "Borrow and repay in one contract",
    summary: "Drawdowns, top-ups, and repayments happen inside the same vault, keeping the on-chain record complete end to end.",
  },
];

const ASSURANCES = [
  {
    title: "Wallet approvals on every action",
    description: "Transactions stop in your wallet for review—no scripts or third parties can bypass your signature.",
  },
  {
    title: "Requests can’t shift mid-loan",
    description: "Once published, loan terms are locked. Lenders never have to guess which parameters will change next.",
  },
  {
    title: "Health alerts that stay current",
    description: "Dashboards track collateral, outstanding principal, and repayment status so both sides know when to act.",
  },
];

export function Features() {
  return (
    <section className="mt-28">
      <div className="rounded-[32px] border border-white/12 bg-surface/90 p-6 shadow-[0_20px_72px_-48px_rgba(15,23,42,0.6)] backdrop-blur-sm sm:p-10">
        <div className="grid gap-y-12 gap-x-10 lg:grid-cols-[minmax(0,1.08fr),minmax(260px,0.92fr)]">
          <div>
            <h2 className="text-[clamp(1.45rem,2.3vw,2rem)] font-semibold text-foreground">How it works</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-secondary-text sm:text-sm">
              Launch a request without sacrificing control. SudoStake handles the protocol flows while you stay present for
              the decisions that affect capital.
            </p>
            <ol className="relative mt-8 space-y-7 before:absolute before:left-[10px] before:top-1 before:bottom-1 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-primary/15 before:to-transparent sm:before:left-[13px]">
              {FLOW.map((item, index) => (
                <li
                  key={item.title}
                  className="relative rounded-3xl border border-transparent bg-background/60 p-5 pl-12 shadow-sm transition hover:border-primary/30 hover:bg-background/80 sm:pl-14 sm:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-3 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary sm:left-4 sm:top-5"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text sm:text-[0.95rem]">{item.summary}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-[clamp(1.35rem,2vw,1.8rem)] font-semibold text-foreground">Guardrails for both sides</h2>
            <p className="mt-4 text-base leading-relaxed text-secondary-text sm:text-sm">
              Purpose-built guardrails keep incentives aligned, even when markets move fast.
            </p>
            <div className="mt-6 grid gap-4">
              {ASSURANCES.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-background/70 px-5 py-5 shadow-sm">
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text">{item.description}</p>
                </div>
              ))}
            </div>
            <Link
              href="/docs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              Read the protocol docs
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
