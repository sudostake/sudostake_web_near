"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import type { PendingRequest } from "@/utils/data/pending";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { SearchIcon } from "@/app/components/icons/SearchIcon";

type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);

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

  const resetFilters = () => {
    setTokenFilter("all");
    setQuery("");
  };

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => {
      refetch();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [error, refetch]);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
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
            {(tokenFilter !== "all" || query.trim()) && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-secondary-text hover:border-foreground/20 hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <label className="relative flex w-full items-center sm:w-auto">
            <span className="sr-only">Search vaults</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-3 text-secondary-text/70">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by vault or token"
              className="w-full rounded-lg border border-border bg-background px-10 py-2.5 text-sm text-foreground placeholder:text-secondary-text/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
            />
          </label>
        </div>
      </header>

      {error && (
        <div
          className="border border-border bg-background p-4 text-sm text-secondary-text"
          role="alert"
        >
          {error} Retrying…
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((idx) => (
            <div key={idx} className="animate-pulse border border-border bg-background p-4">
              <div className="h-4 w-1/3 rounded bg-foreground/10" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-foreground/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="border border-border bg-background p-5 text-sm text-secondary-text">
          {items.length === 0 ? (
            <>No open requests right now.</>
          ) : (
            <>
              Nothing matches your filters.{" "}
              <button type="button" className="font-medium text-primary underline" onClick={resetFilters}>
                Clear filters
              </button>{" "}
              to view all requests.
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
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary/35 bg-primary/10 text-primary"
          : "border-border bg-background text-secondary-text hover:border-foreground/20 hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
