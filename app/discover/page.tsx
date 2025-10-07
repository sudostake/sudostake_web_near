"use client";

import React from "react";
import { getActiveFactoryId } from "@/utils/networks";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";
import { Container } from "@/app/components/layout/Container";

export default function DiscoverPage() {
  const factoryId = getActiveFactoryId();
  return (
    <div className="min-h-screen bg-background pb-24">
      <Container className="pt-24">
        <main id="main" className="space-y-6">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Marketplace</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,2.6rem)] font-semibold">Discover active liquidity requests</h1>
            <p className="mt-2 text-sm text-secondary-text">
              Review open vault requests, assess collateral ratios, and decide which borrowers to fund.
            </p>
          </header>
          <PendingRequestsList factoryId={factoryId} />
        </main>
      </Container>
    </div>
  );
}
