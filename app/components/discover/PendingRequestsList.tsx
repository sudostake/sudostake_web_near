"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import type { PendingRequest } from "@/utils/data/pending";

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);

  // Track whether the sticky header is currently affixed to the top to toggle a bottom shadow
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sentinel = document.getElementById("discover-header-sentinel");
    if (!sentinel) return;
    const rootStyles = getComputedStyle(document.documentElement);
    const navVar = rootStyles.getPropertyValue("--nav-height").trim();
    const parsed = parseInt(navVar, 10);
    const navPx = Number.isFinite(parsed) ? parsed : 56;
    const rootMargin = `-${navPx}px 0px 0px 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const next = entry.intersectionRatio < 1;
        setStuck((prev) => (prev !== next ? next : prev));
      },
      { root: null, rootMargin, threshold: [1] }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  // Show all pending liquidity requests directly from the data source
  type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };
  const items = useMemo(() => {
    return (data ?? []).filter((d): d is WithRequest => Boolean(d.liquidity_request)) as WithRequest[];
  }, [data]);

  // No filters for now; only sticky header behavior retained

  return (
    <div className="space-y-4">
      {/* Sentinel to detect affixed sticky header */}
      <div id="discover-header-sentinel" aria-hidden className="h-px" />
      <header
        className={[
          "sticky z-30 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow",
          stuck ? "border-b border-foreground/10 shadow-sm" : "",
        ].join(" ")}
        style={{ top: "var(--nav-height, 56px)" }}
      >
        <div className="px-3 py-3">
          <SectionHeader
            title="Discover Requests"
            caption={<>{items.length} open request{items.length === 1 ? "" : "s"}</>}
          />
        </div>
      </header>
      
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700" role="alert">
          {error}
          <button className="ml-3 font-medium text-red-700 underline hover:text-red-800" onClick={refetch}>
            Retry
          </button>
        </div>
      )}
      {loading && (
        <div className="space-y-3">
          {[0, 1].map((idx) => (
            <div key={idx} className="animate-pulse rounded-2xl border bg-surface p-4">
              <div className="h-4 w-1/3 rounded bg-foreground/10" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-foreground/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="rounded-2xl border bg-surface p-6 text-sm text-secondary-text">
          No open requests right now. Check back soon or{" "}
          <button className="font-medium text-primary underline" onClick={refetch}>
            refresh
          </button>
          .
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {items.map((it) => (
          <PendingRequestCard key={it.id} item={it} factoryId={factoryId} />
        ))}
      </div>
    </div>
  );
}
