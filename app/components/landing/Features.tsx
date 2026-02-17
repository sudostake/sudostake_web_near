"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

const PATHS = [
  {
    title: "I want to borrow",
    summary: "Create a vault, open a USDC request, and manage repayment from the dashboard.",
    steps: [
      "Connect a supported wallet.",
      "Create your vault and open a request.",
      "Repay before liquidation starts.",
    ],
    href: "/dashboard",
    cta: "Start borrower flow",
  },
  {
    title: "I want to lend",
    summary: "Use Discover to review live requests and fund one directly from your wallet.",
    steps: [
      "Browse open requests in Discover.",
      "Check amount, term, collateral, and APR.",
      "Accept a request when terms fit your strategy.",
    ],
    href: "/discover",
    cta: "Open Discover",
  },
];

export function Features() {
  return (
    <section className="mt-28">
      <div className="rounded-4xl border border-white/12 bg-surface/90 p-6 shadow-[0_20px_72px_-48px_rgba(15,23,42,0.6)] backdrop-blur-sm sm:p-10">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-[clamp(1.45rem,2.3vw,2rem)] font-semibold text-foreground">Choose your next action</h2>
            <p className="text-base leading-relaxed text-secondary-text sm:text-sm">
              Pick the path that matches what you want to do right now and jump straight into the flow.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {PATHS.map((path) => (
              <div key={path.title} className="rounded-3xl border border-white/10 bg-background/70 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{path.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">{path.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-secondary-text">
                  {path.steps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary/80" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                <Link href={path.href} className="mt-5 inline-flex">
                  <Button variant="primary" size="md">
                    {path.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
            Need details first? Read docs
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.65rem]"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
