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
    <div>
      {/* Sentinel to detect affixed sticky header */}
      <div id="discover-header-sentinel" aria-hidden className="h-px" />
      <header
        className={[
          "sticky z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow",
          stuck ? "border-b border-foreground/10 shadow-sm" : "shadow-none",
        ].join(" ")}
        style={{ top: "var(--nav-height, 56px)" }}
      >
        <div className="py-2 px-3">
          <SectionHeader
            title="Discover Requests"
            caption={<>{items.length} open request{items.length === 1 ? "" : "s"}</>}
          />
        </div>
      </header>
      
      {error && (
        <div className="mt-3 text-sm text-red-600" role="alert">
          {error}
          <button className="ml-2 underline" onClick={refetch}>Retry</button>
        </div>
      )}
      {loading && (
        <div className="mt-3 animate-pulse space-y-2">
          <div className="rounded border bg-surface p-3">
            <div className="h-4 w-3/5 bg-foreground/10 rounded" />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
            </div>
          </div>
          <div className="rounded border bg-surface p-3">
            <div className="h-4 w-2/5 bg-foreground/10 rounded" />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded" />
            </div>
          </div>
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="mt-6 rounded border bg-surface p-6 text-sm text-secondary-text">
          <div>No open requests.</div>
        </div>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3">
        {items.map((it) => (
          <PendingRequestCard key={it.id} item={it} factoryId={factoryId} />
        ))}
      </div>
      
    </div>
  );
}
