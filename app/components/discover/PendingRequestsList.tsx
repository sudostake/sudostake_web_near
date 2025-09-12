"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { PendingFilters } from "./PendingFilters";
import type { PendingFilters as FiltersValue } from "./PendingFilters";
import { getTokenDecimals } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import Big from "big.js";
import type { PendingRequest } from "@/utils/data/pending";
import { Button } from "@/app/components/ui/Button";

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);
  const [filters, setFilters] = useState<FiltersValue>({ q: "", token: null, minAmount: "", maxDays: "", sort: "updated_desc" });
  const [showFilters, setShowFilters] = useState(true);

  const network = networkFromFactoryId(factoryId);

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
          const dec = getTokenDecimals(d.liquidity_request!.token, network);
          const display = new Big(d.liquidity_request!.amount).div(new Big(10).pow(dec));
          if (display.lt(new Big(filters.minAmount))) return false;
        } catch {}
      }
      if (filters.maxDays) {
        const days = Math.max(1, Math.round((d.liquidity_request!.duration ?? 0) / 86400));
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
        const aprA = new Big(a.liquidity_request.interest).div(a.liquidity_request.amount).times(365).div(Math.max(1, Math.round(a.liquidity_request.duration/86400)));
        const aprB = new Big(b.liquidity_request.interest).div(b.liquidity_request.amount).times(365).div(Math.max(1, Math.round(b.liquidity_request.duration/86400)));
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
      setShowFilters(false); // default collapsed on all screens
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

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.q.trim()) n++;
    if (filters.token) n++;
    if (filters.minAmount.trim()) n++;
    if (filters.maxDays.trim()) n++;
    // sort not counted; default is "updated_desc"
    return n;
  }, [filters]);

  function FunnelIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 10h12m-7 5h2" />
      </svg>
    );
  }

  const clearFilters = () =>
    setFilters({ q: "", token: null, minAmount: "", maxDays: "", sort: "updated_desc" });

  return (
    <div>
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
      {showFilters && (
        <div id="discover-filters" className="mt-3">
          <PendingFilters value={filters} onChange={setFilters} />
        </div>
      )}
      {error && (
        <div className="mt-3 text-sm text-red-600" role="alert">
          {error}
          <button className="ml-2 underline" onClick={refetch}>Retry</button>
        </div>
      )}
      {loading && (
        <div className="mt-3 animate-pulse space-y-2">
          <div className="h-20 bg-surface rounded" />
          <div className="h-20 bg-surface rounded" />
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="mt-3 text-sm text-secondary-text">No matching requests.</div>
      )}
      <div className="mt-3 grid grid-cols-1 gap-2">
        {filtered.map((it) => (
          <PendingRequestCard key={it.id} item={it} factoryId={factoryId} />
        ))}
      </div>
    </div>
  );
}
