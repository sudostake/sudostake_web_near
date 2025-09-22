"use client";

import React from "react";
import { getActiveFactoryId } from "@/utils/networks";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";

export default function DiscoverPage() {
  const factoryId = getActiveFactoryId();
  return (
    <div className="min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      <main id="main" className="w-full max-w-2xl mx-auto">
        <PendingRequestsList factoryId={factoryId} />
      </main>
    </div>
  );
}
