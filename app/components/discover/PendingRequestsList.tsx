"use client";

import React, { useEffect, useMemo } from "react";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { PendingRequestCard } from "./PendingRequestCard";
import type { PendingRequest } from "@/utils/data/pending";
import { getTokenConfigById } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { Button } from "@/app/components/ui/Button";

type WithRequest = PendingRequest & { liquidity_request: NonNullable<PendingRequest["liquidity_request"]> };

type AvailableRequest = {
  entry: WithRequest;
  tokenSymbol: string;
  tokenDecimals: number;
};

export function PendingRequestsList({ factoryId }: { factoryId: string }) {
  const { data, loading, error, refetch } = usePendingRequests(factoryId);
  const network = useMemo(() => networkFromFactoryId(factoryId), [factoryId]);

  const availableRequests = useMemo<AvailableRequest[]>(() => {
    const list = (data ?? []).filter((d): d is WithRequest => Boolean(d.liquidity_request));
    return list.map((entry) => {
      const tokenId = entry.liquidity_request.token;
      const cfg = getTokenConfigById(tokenId, network);
      const fallback = tokenId.includes(".") ? tokenId.split(".")[0]?.toUpperCase() ?? tokenId : tokenId;

      return {
        entry,
        tokenSymbol: cfg?.symbol ?? fallback,
        tokenDecimals: cfg?.decimals ?? 6,
      };
    });
  }, [data, network]);

  const showingText = useMemo(() => {
    if (loading) return "Loading opportunities to fund...";
    const count = availableRequests.length;
    return `${count} opportunit${count === 1 ? "y" : "ies"} to fund`;
  }, [loading, availableRequests.length]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => {
      refetch();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [error, refetch]);

  return (
    <div className="space-y-4">
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

      <p className="px-1 text-xs text-secondary-text">{showingText}</p>

      {loading && availableRequests.length === 0 && (
        <div className="space-y-2">
          {[0, 1].map((idx) => (
            <div key={idx} className="animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <div className="h-4 w-2/5 rounded bg-foreground/10" />
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-foreground/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && availableRequests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-secondary-text">
          No opportunities to fund right now. Check back shortly.
        </div>
      )}

      {availableRequests.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {availableRequests.map(({ entry, tokenSymbol, tokenDecimals }) => (
            <PendingRequestCard
              key={entry.id}
              item={entry}
              factoryId={factoryId}
              tokenSymbol={tokenSymbol}
              tokenDecimals={tokenDecimals}
            />
          ))}
        </div>
      )}
    </div>
  );
}
