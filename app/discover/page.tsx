"use client";

import React from "react";
import Link from "next/link";
import { getActiveFactoryId } from "@/utils/networks";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";
import { Container } from "@/app/components/layout/Container";

const TIPS = [
  "Use the filters to zero in on the tokens and vaults that fit your mandate.",
  "Open the vault view to audit collateral history, health, and pending actions.",
  "Refresh periodically to catch new requests and status changes as they land.",
];

function formatNetworkLabel(network: string) {
  if (network === "mainnet") return "NEAR mainnet";
  if (network === "testnet") return "NEAR testnet";
  return network;
}

export default function DiscoverPage() {
  const factoryId = getActiveFactoryId();
  const network = formatNetworkLabel(networkFromFactoryId(factoryId));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-26vh] h-[55vh] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.2),transparent_60%)]"
      />
      <Container className="relative pt-16 sm:pt-20 space-y-10">
        <header className="relative overflow-hidden rounded-[32px] border border-white/14 bg-surface/90 px-6 py-9 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.65)] backdrop-blur-sm sm:px-12 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.22),transparent_70%)] blur-2xl"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
                <span>{network} marketplace</span>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/90">Marketplace</p>
                <h1 className="text-[clamp(2.1rem,4.2vw,2.8rem)] font-semibold text-foreground">
                  Discover active liquidity requests
                </h1>
                <p className="text-base leading-relaxed text-secondary-text sm:text-sm">
                  Compare live borrow requests at a glance. Each card surfaces collateral, APR, and runway—and links straight
                  to the vault so you can review on-chain history before committing capital.
                </p>
              </div>
              <Link
                href="/docs/features/discover"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                Read the lender guide
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.65rem] transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
            <aside className="relative max-w-sm rounded-3xl border border-white/12 bg-background/85 p-6 text-sm text-secondary-text shadow-sm sm:p-7">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-text/90">
                Quick checklist
              </h2>
              <ul className="mt-4 space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-primary/80"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </header>
        <main id="main">
          <PendingRequestsList factoryId={factoryId} />
        </main>
      </Container>
    </div>
  );
}
