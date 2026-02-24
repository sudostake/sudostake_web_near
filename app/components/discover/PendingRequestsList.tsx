"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import type { PendingRequest } from "@/utils/data/pending";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { SearchIcon } from "@/app/components/icons/SearchIcon";
import { formatMinimalTokenAmount, parseNumber } from "@/utils/format";
import { calculateApr } from "@/utils/finance";
import { SegmentedToggle } from "@/app/components/ui/SegmentedToggle";
import { Button } from "@/app/components/ui/Button";
import { SECONDS_PER_DAY } from "@/utils/constants";
import { formatDurationFromSeconds } from "@/utils/time";

type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };
type SortMode = "updated_desc" | "apr_desc" | "amount_desc" | "term_asc";

type EnrichedRequest = {
  index: number;
  entry: WithRequest;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: number;
  amountDisplay: string;
  amountValue: number;
  aprValue: number;
  durationSeconds: number;
  searchable: string;
};

const SORT_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: "updated_desc", label: "Newest" },
  { id: "apr_desc", label: "APR" },
  { id: "amount_desc", label: "Amount" },
  { id: "term_asc", label: "Term" },
];

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);

  const items = useMemo(() => (data ?? []).filter((d): d is WithRequest => Boolean(d.liquidity_request)), [data]);

  const network = useMemo(() => networkFromFactoryId(factoryId), [factoryId]);

  const enrichedItems = useMemo<EnrichedRequest[]>(() => {
    return items.map((entry, index) => {
      const lr = entry.liquidity_request;
      const tokenId = lr.token;
      const cfg = getTokenConfigById(tokenId, network);
      const tokenDecimals = cfg?.decimals ?? 6;
      const fallback = tokenId.includes(".") ? tokenId.split(".")[0]?.toUpperCase() ?? tokenId : tokenId;
      const tokenSymbol = cfg?.symbol ?? fallback;
      const amountDisplay = formatMinimalTokenAmount(lr.amount, tokenDecimals);
      const amountValue = parseNumber(amountDisplay);
      const durationSeconds = Math.max(0, Number(lr.duration) || 0);
      let aprValue = Number.NaN;
      try {
        const aprPct = calculateApr(lr.interest, lr.amount, durationSeconds).times(100);
        aprValue = aprPct.gt(0) ? parseNumber(aprPct.toString()) : Number.NaN;
      } catch {
        aprValue = Number.NaN;
      }
      const searchable = [
        entry.id,
        entry.owner ?? "",
        tokenId,
        tokenSymbol,
      ]
        .join(" ")
        .toLowerCase();

      return {
        index,
        entry,
        tokenId,
        tokenSymbol,
        tokenDecimals,
        amountDisplay,
        amountValue,
        aprValue,
        durationSeconds,
        searchable,
      };
    });
  }, [items, network]);

  const tokenFilters = useMemo(
    () =>
      Array.from(
        enrichedItems.reduce<Map<string, string>>((map, item) => {
          if (!map.has(item.tokenId)) map.set(item.tokenId, item.tokenSymbol);
          return map;
        }, new Map<string, string>())
      )
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [enrichedItems]
  );

  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxTermDays, setMaxTermDays] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated_desc");

  useEffect(() => {
    const valid = tokenFilter === "all" || tokenFilters.some((token) => token.id === tokenFilter);
    if (!valid) {
      setTokenFilter("all");
    }
  }, [tokenFilter, tokenFilters]);

  const normalizedQuery = query.trim().toLowerCase();
  const minAmountValue = parseNumber(minAmount);
  const hasMinAmount = Number.isFinite(minAmountValue) && minAmountValue > 0;
  const maxTermDaysValue = parseNumber(maxTermDays);
  const hasMaxTermDays = Number.isFinite(maxTermDaysValue) && maxTermDaysValue > 0;

  const filteredItems = useMemo<EnrichedRequest[]>(() => {
    const normalized = query.trim().toLowerCase();
    return enrichedItems
      .filter((item) => {
        if (tokenFilter !== "all" && item.tokenId !== tokenFilter) return false;
        if (normalized && !item.searchable.includes(normalized)) return false;
        if (hasMinAmount && (!Number.isFinite(item.amountValue) || item.amountValue < minAmountValue)) return false;
        if (hasMaxTermDays && item.durationSeconds > Math.floor(maxTermDaysValue * SECONDS_PER_DAY)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortMode === "updated_desc") return a.index - b.index;
        if (sortMode === "term_asc") return a.durationSeconds - b.durationSeconds;
        if (sortMode === "amount_desc") return compareNumberDesc(a.amountValue, b.amountValue, a.index - b.index);
        return compareNumberDesc(a.aprValue, b.aprValue, a.index - b.index);
      });
  }, [
    query,
    enrichedItems,
    tokenFilter,
    hasMinAmount,
    minAmountValue,
    hasMaxTermDays,
    maxTermDaysValue,
    sortMode,
  ]);

  const showingText = useMemo(() => {
    if (loading) return "Loading open requests...";
    return `Showing ${filteredItems.length} of ${enrichedItems.length} open requests`;
  }, [loading, filteredItems.length, enrichedItems.length]);

  const activeTokenCount = useMemo(
    () => new Set(filteredItems.map((item) => item.tokenId)).size,
    [filteredItems]
  );

  const topAprLabel = useMemo(() => {
    const maxApr = filteredItems.reduce<number>((max, item) => {
      if (!Number.isFinite(item.aprValue)) return max;
      return Math.max(max, item.aprValue);
    }, Number.NEGATIVE_INFINITY);
    return Number.isFinite(maxApr) ? `${maxApr.toFixed(2)}%` : "n/a";
  }, [filteredItems]);

  const shortestTermLabel = useMemo(() => {
    const minTerm = filteredItems.reduce<number>((min, item) => {
      if (item.durationSeconds <= 0) return min;
      return Math.min(min, item.durationSeconds);
    }, Number.POSITIVE_INFINITY);
    return Number.isFinite(minTerm) ? formatDurationFromSeconds(minTerm) : "n/a";
  }, [filteredItems]);

  const resetFilters = () => {
    setTokenFilter("all");
    setQuery("");
    setMinAmount("");
    setMaxTermDays("");
    setSortMode("updated_desc");
  };

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => {
      refetch();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [error, refetch]);

  const hasActiveFilters =
    tokenFilter !== "all" || normalizedQuery.length > 0 || hasMinAmount || hasMaxTermDays || sortMode !== "updated_desc";

  return (
    <div className="space-y-4">
      <section className="surface-card rounded-3xl px-4 py-5 shadow-[0_18px_64px_-44px_rgba(15,23,42,0.55)] sm:px-5 sm:py-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/85">Lender workspace</p>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.7rem)] font-semibold leading-tight text-foreground">
                Active borrower requests
              </h2>
              <p className="text-sm leading-relaxed text-secondary-text">
                Filter terms fast, compare pricing, then open a vault to fund the request.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
              <div className="grid grid-cols-3 gap-2">
                <ListMetric label="Visible" value={String(filteredItems.length)} />
                <ListMetric label="Tokens" value={String(activeTokenCount)} />
                <ListMetric label="Top APR" value={topAprLabel} />
              </div>
              <button
                type="button"
                onClick={refetch}
                className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs font-medium text-secondary-text transition hover:border-foreground/20 hover:text-foreground"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh feed"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr),170px,170px]">
            <label className="relative block">
              <span className="sr-only">Search vault, owner, or token</span>
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search vault, owner, or token"
                className="h-10 w-full rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-10 text-sm text-foreground placeholder:text-secondary-text focus-soft"
              />
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-secondary-text">
              Min amount
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={minAmount}
                onChange={(event) => setMinAmount(event.target.value)}
                placeholder="0"
                className="mt-1.5 h-10 w-full rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-normal normal-case tracking-normal text-foreground placeholder:text-secondary-text focus-soft"
              />
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-secondary-text">
              Max term (days)
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={maxTermDays}
                onChange={(event) => setMaxTermDays(event.target.value)}
                placeholder="Any"
                className="mt-1.5 h-10 w-full rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-normal normal-case tracking-normal text-foreground placeholder:text-secondary-text focus-soft"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
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
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-[color:var(--border)] px-3.5 py-1.5 text-sm font-medium text-secondary-text transition hover:border-foreground/20 hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="w-full lg:max-w-[480px]">
              <SegmentedToggle
                value={sortMode}
                onChange={(value) => setSortMode(value as SortMode)}
                options={SORT_OPTIONS}
                ariaLabel="Sort open requests"
                size="sm"
                variant="primary"
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="surface-card rounded-2xl px-4 py-4 text-sm text-secondary-text"
          role="alert"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{error} Retrying automatically...</p>
            <Button type="button" variant="secondary" size="sm" onClick={refetch}>
              Retry now
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-secondary-text">
        <p>{showingText}</p>
        <p>Shortest visible term: {shortestTermLabel}</p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[0, 1].map((idx) => (
            <div key={idx} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <div className="h-4 w-2/5 rounded bg-foreground/10" />
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-foreground/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-secondary-text">
          {enrichedItems.length === 0 ? (
            <>No open requests right now. Check back shortly.</>
          ) : (
            <>
              Nothing matches your filters.{" "}
              <button type="button" className="font-medium text-primary underline" onClick={resetFilters}>
                Clear filters
              </button>{" "}
              to restore the full request board.
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((it) => (
          <PendingRequestCard
            key={it.entry.id}
            item={it.entry}
            factoryId={factoryId}
            tokenSymbol={it.tokenSymbol}
            tokenDecimals={it.tokenDecimals}
          />
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

function compareNumberDesc(a: number, b: number, fallback: number) {
  const aValid = Number.isFinite(a);
  const bValid = Number.isFinite(b);
  if (!aValid && !bValid) return fallback;
  if (!aValid) return 1;
  if (!bValid) return -1;
  if (a === b) return fallback;
  return b - a;
}

function ListMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[95px] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-secondary-text">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
