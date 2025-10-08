"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import type { PendingRequest } from "@/utils/data/pending";
import { Button } from "@/app/components/ui/Button";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { SearchIcon } from "@/app/components/icons/SearchIcon";

type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);

  // Track whether the sticky header is currently affixed to the top to toggle a shadow.
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

  const items = useMemo(() => (data ?? []).filter((d): d is WithRequest => Boolean(d.liquidity_request)), [data]);

  const network = useMemo(() => networkFromFactoryId(factoryId), [factoryId]);

  const tokenLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of items) {
      const tokenId = entry.liquidity_request.token;
      if (!tokenId) continue;
      if (map.has(tokenId)) continue;
      const cfg = getTokenConfigById(tokenId, network);
      const fallback = tokenId.includes(".") ? tokenId.split(".")[0]?.toUpperCase() ?? tokenId : tokenId;
      map.set(tokenId, cfg?.symbol ?? fallback);
    }
    return map;
  }, [items, network]);

  const tokenFilters = useMemo(
    () => Array.from(tokenLabelMap.entries()).map(([id, label]) => ({ id, label })),
    [tokenLabelMap]
  );

  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (tokenFilter !== "all" && !tokenLabelMap.has(tokenFilter)) {
      setTokenFilter("all");
    }
  }, [tokenFilter, tokenLabelMap]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((entry) => {
      const lr = entry.liquidity_request;
      if (!lr) return false;
      if (tokenFilter !== "all" && lr.token !== tokenFilter) return false;
      if (!normalized) return true;
      const label = tokenLabelMap.get(lr.token) ?? "";
      return (
        entry.id.toLowerCase().includes(normalized) ||
        lr.token.toLowerCase().includes(normalized) ||
        label.toLowerCase().includes(normalized)
      );
    });
  }, [items, tokenFilter, query, tokenLabelMap]);

  const totalOpen = items.length;
  const filteredCount = filteredItems.length;

  const resetFilters = () => {
    setTokenFilter("all");
    setQuery("");
  };

  return (
    <div className="space-y-4">
      <div id="discover-header-sentinel" aria-hidden="true" className="h-px" />
      <header
        className={[
          "sticky z-30 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow",
          stuck ? "border-b border-foreground/10 shadow-sm" : "",
        ].join(" ")}
        style={{ top: "var(--nav-height, 56px)" }}
      >
        <div className="px-3 py-4 space-y-4">
          <SectionHeader
            title="Discover Requests"
            caption={
              <span className="flex items-center gap-2">
                <span>
                  Showing {filteredCount} of {totalOpen} open request{totalOpen === 1 ? "" : "s"}
                </span>
                {filteredCount !== totalOpen && (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                    Filters applied
                  </span>
                )}
              </span>
            }
            right={
              <div className="flex flex-wrap items-center justify-end gap-2">
                {(tokenFilter !== "all" || query.trim()) && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={refetch}>
                  Refresh feed
                </Button>
              </div>
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All tokens"
                active={tokenFilter === "all"}
                onClick={() => setTokenFilter("all")}
              />
              {tokenFilters.map((token) => (
                <FilterChip
                  key={token.id}
                  label={token.label}
                  active={tokenFilter === token.id}
                  onClick={() => setTokenFilter(token.id)}
                />
              ))}
            </div>
            <label className="relative flex w-full items-center sm:w-auto">
              <span className="sr-only">Search vaults</span>
              <span aria-hidden="true" className="pointer-events-none absolute left-4 text-secondary-text/70">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by vault or token"
                className="w-full rounded-full border border-white/14 bg-background/80 px-11 py-2.5 text-sm text-foreground placeholder:text-secondary-text/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-72"
              />
            </label>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50/85 p-4 text-sm text-red-700 shadow-sm" role="alert">
          {error}
          <button className="ml-3 font-medium text-red-700 underline hover:text-red-800" onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((idx) => (
            <div key={idx} className="animate-pulse rounded-2xl border border-white/10 bg-surface/80 p-4 shadow-sm">
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

      {!loading && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-white/12 bg-surface/90 p-6 text-sm text-secondary-text shadow-sm">
          {totalOpen === 0 ? (
            <>
              No open requests right now. Check back soon or{" "}
              <button className="font-medium text-primary underline" onClick={refetch}>
                refresh
              </button>
              .
            </>
          ) : (
            <>
              Nothing matches your filters.{" "}
              <button className="font-medium text-primary underline" onClick={resetFilters}>
                Reset them
              </button>{" "}
              to review every open request.
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((it) => (
          <PendingRequestCard key={it.id} item={it} factoryId={factoryId} />
        ))}
      </div>
    </div>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-primary/40 bg-primary/15 text-primary shadow-sm"
          : "border-white/14 bg-background/80 text-secondary-text hover:border-primary/30 hover:text-primary",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
