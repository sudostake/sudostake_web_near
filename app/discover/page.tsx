"use client";

import React from "react";
import { getActiveFactoryId } from "@/utils/networks";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";
import { Container } from "@/app/components/layout/Container";

export default function DiscoverPage() {
  const factoryId = getActiveFactoryId();
  return (
    <div className="min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      <Container>
        <main id="main" className="w-full">
          <PendingRequestsList factoryId={factoryId} />
        </main>
      </Container>
    </div>
  );
}
