"use client";

import React from "react";
import { getActiveFactoryId } from "@/utils/networks";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";
import { Container } from "@/app/components/layout/Container";

export default function DiscoverPage() {
  const factoryId = getActiveFactoryId();

  return (
    <div className="min-h-screen pb-16">
      <Container className="pt-12 sm:pt-16">
        <header>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Open requests</h1>
        </header>
        <main id="main" className="mt-8 sm:mt-10">
          <PendingRequestsList factoryId={factoryId} />
        </main>
      </Container>
    </div>
  );
}
