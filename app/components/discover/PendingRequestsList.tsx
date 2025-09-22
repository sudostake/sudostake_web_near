"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Card } from "@/app/components/ui/Card";
import { PendingFilters } from "./PendingFilters";
import type { PendingFilters as FiltersValue } from "./PendingFilters";
import { getTokenDecimals, getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import Big from "big.js";
import type { PendingRequest } from "@/utils/data/pending";
import { Button } from "@/app/components/ui/Button";
import { calculateApr } from "@/utils/finance";
import { SegmentedToggle } from "@/app/components/ui/SegmentedToggle";

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);
  const [filters, setFilters] = useState<FiltersValue>({ q: "", token: null, minAmount: "", maxDays: "", sort: "updated_desc" });
  const [showFilters, setShowFilters] = useState(true);

  const network = networkFromFactoryId(factoryId);

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

  // Client-side filtering/sorting for v1
  type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };
  const filtered = useMemo(() => {
    const lrList: WithRequest[] = (data ?? []).filter((d): d is WithRequest => Boolean(d.liquidity_request)) as WithRequest[];
    const q = filters.q.trim().toLowerCase();
    let next: WithRequest[] = lrList.filter((d) => {
      const id = d.id.toLowerCase();
      const owner = (d.owner ?? "").toLowerCase();
      if (q && !(id.includes(q) || owner.includes(q))) return false;
      if (filters.token && d.liquidity_request?.token !== filters.token) return false;
      if (filters.minAmount) {
        try {
          const dec = getTokenDecimals(d.liquidity_request.token, network);
          const display = new Big(d.liquidity_request.amount).div(new Big(10).pow(dec));
          if (display.lt(new Big(filters.minAmount))) return false;
        } catch {}
      }
      if (filters.maxDays) {
        const days = Math.max(1, Math.round((d.liquidity_request.duration ?? 0) / 86400));
        if (days > Number(filters.maxDays)) return false;
      }
      return true;
    });

    const byAmountDesc = (a: WithRequest, b: WithRequest) => {
      try {
        const da = getTokenDecimals(a.liquidity_request.token, network);
        const db = getTokenDecimals(b.liquidity_request.token, network);
        const va = new Big(a.liquidity_request.amount).div(new Big(10).pow(da));
        const vb = new Big(b.liquidity_request.amount).div(new Big(10).pow(db));
        return vb.cmp(va);
      } catch { return 0; }
    };
    const byAprDesc = (a: WithRequest, b: WithRequest) => {
      try {
        const aprA = calculateApr(a.liquidity_request.interest, a.liquidity_request.amount, a.liquidity_request.duration);
        const aprB = calculateApr(b.liquidity_request.interest, b.liquidity_request.amount, b.liquidity_request.duration);
        return aprB.cmp(aprA);
      } catch { return 0; }
    };
    const byTermAsc = (a: WithRequest, b: WithRequest) => Math.max(1, Math.round(a.liquidity_request.duration/86400)) - Math.max(1, Math.round(b.liquidity_request.duration/86400));

    switch (filters.sort) {
      case "amount_desc":
        next = next.slice().sort(byAmountDesc);
        break;
      case "apr_desc":
        next = next.slice().sort(byAprDesc);
        break;
      case "term_asc":
        next = next.slice().sort(byTermAsc);
        break;
      case "updated_desc":
      default:
        // rely on Firestore updated_at desc sorting in subscription; keep as-is
        break;
    }
    return next;
  }, [data, filters, network]);

  // Persist toggle state and default collapsed on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("discover:filters:open");
    if (saved === null) {
      // Default: expanded on md+ screens, collapsed on small screens
      const isDesktop = window.matchMedia && window.matchMedia("(min-width: 768px)").matches;
      setShowFilters(isDesktop);
    } else {
      setShowFilters(saved === "1");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("discover:filters:open", showFilters ? "1" : "0");
    } catch {}
  }, [showFilters]);

  // Persist filter values so users keep state when returning
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("discover:filters:value");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FiltersValue>;
        const next: FiltersValue = {
          q: typeof parsed.q === "string" ? parsed.q : "",
          token: typeof parsed.token === "string" ? parsed.token : null,
          minAmount: typeof parsed.minAmount === "string" ? parsed.minAmount : "",
          maxDays: typeof parsed.maxDays === "string" ? parsed.maxDays : "",
          sort: (parsed.sort === "amount_desc" || parsed.sort === "apr_desc" || parsed.sort === "term_asc" || parsed.sort === "updated_desc") ? parsed.sort : "updated_desc",
        };
        setFilters(next);
      }
    } catch {}
    // run only once on mount
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("discover:filters:value", JSON.stringify(filters));
    } catch {}
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.q.trim()) n++;
    if (filters.token) n++;
    if (filters.minAmount.trim()) n++;
    if (filters.maxDays.trim()) n++;
    // sort not counted; default is "updated_desc"
    return n;
  }, [filters]);

  const sortLabel = useMemo(() => {
    switch (filters.sort) {
      case "amount_desc": return "Amount (desc)";
      case "apr_desc": return "APR (desc)";
      case "term_asc": return "Term (asc)";
      case "updated_desc":
      default: return "Newest";
    }
  }, [filters.sort]);

  function FunnelIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 10h12m-7 5h2" />
      </svg>
    );
  }

  function XIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M10 8.586 5.707 4.293A1 1 0 1 0 4.293 5.707L8.586 10l-4.293 4.293a1 1 0 1 0 1.414 1.414L10 11.414l4.293 4.293a1 1 0 0 0 1.414-1.414L11.414 10l4.293-4.293A1 1 0 1 0 14.293 4.293L10 8.586Z" clipRule="evenodd" />
      </svg>
    );
  }

  const clearFilters = () =>
    setFilters({ q: "", token: null, minAmount: "", maxDays: "", sort: "updated_desc" });

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
            caption={<>{(data ?? []).length} open</>}
            right={
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters((v) => !v)}
                  className="inline-flex items-center gap-2"
                  aria-expanded={showFilters || undefined}
                  aria-controls="discover-filters"
                >
                  <FunnelIcon />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="text-xs text-secondary-text">({activeFilterCount})</span>
                  )}
                </Button>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    Clear
                  </Button>
                )}
              </div>
            }
          />
          <div className="mt-2 text-xs text-secondary-text" aria-live="polite">
            {filtered.length} result{filtered.length === 1 ? "" : "s"} • sorted by {sortLabel}
          </div>
          <div className="mt-2">
            <SegmentedToggle
              value={filters.sort}
              onChange={(v) => setFilters({ ...filters, sort: v as FiltersValue["sort"] })}
              options={[
                { id: "updated_desc", label: "Newest" },
                { id: "amount_desc", label: "Amount" },
                { id: "apr_desc", label: "APR" },
                { id: "term_asc", label: "Term" },
              ]}
              size="sm"
              variant="neutral"
              ariaLabel="Sort results"
            />
          </div>
        </div>
      </header>
      
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-live="polite">
          {filters.q.trim() && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, q: "" })}
              className="inline-flex items-center gap-1 rounded-full border bg-surface px-2 py-1 text-xs hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Remove search filter: ${filters.q.trim()}`}
            >
              <span>Search: “{filters.q.trim()}”</span>
              <XIcon />
            </button>
          )}
          {filters.token && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, token: null })}
              className="inline-flex items-center gap-1 rounded-full border bg-surface px-2 py-1 text-xs hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Remove token filter"
              title={filters.token}
            >
              <span>
                Token: {getTokenConfigById(filters.token, network)?.symbol ?? filters.token}
              </span>
              <XIcon />
            </button>
          )}
          {filters.minAmount.trim() && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, minAmount: "" })}
              className="inline-flex items-center gap-1 rounded-full border bg-surface px-2 py-1 text-xs hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Remove min amount filter: ${filters.minAmount}`}
            >
              <span>Min ≥ {filters.minAmount}</span>
              <XIcon />
            </button>
          )}
          {filters.maxDays.trim() && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, maxDays: "" })}
              className="inline-flex items-center gap-1 rounded-full border bg-surface px-2 py-1 text-xs hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Remove max term filter: ${filters.maxDays} days`}
            >
              <span>Term ≤ {filters.maxDays}d</span>
              <XIcon />
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="ml-1 text-xs underline text-secondary-text hover:text-foreground"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}
      {showFilters && (
        <Card id="discover-filters" className="mt-3">
          <PendingFilters value={filters} onChange={setFilters} />
        </Card>
      )}
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
      {!loading && filtered.length === 0 && (
        <div className="mt-6 rounded border bg-surface p-6 text-sm text-secondary-text">
          <div>No matching requests.</div>
          {activeFilterCount > 0 && (
            <button className="mt-2 text-primary underline" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3">
        {filtered.map((it) => (
          <PendingRequestCard key={it.id} item={it} factoryId={factoryId} />
        ))}
      </div>
      
    </div>
  );
}
