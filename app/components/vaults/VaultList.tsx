"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { useState } from "react";
import { VaultIcon } from "@/app/components/vaults/VaultIcon";

export type VaultSummary = { id: string; state: "idle" | "pending" | "active" };
export type VaultListProps = {
  vaultIds: string[];
  onVaultClick?: (vaultId: string) => void;
  summaries?: VaultSummary[];
};

export function VaultList({ vaultIds, onVaultClick, summaries }: VaultListProps) {
  const [copied] = useState<string | null>(null);

  const stateFor = (id: string): VaultSummary["state"] | undefined => {
    const s = summaries?.find((v) => v.id === id)?.state;
    return s;
  };

  const badge = (state?: VaultSummary["state"]) => {
    if (!state || state === "idle") return null;
    const label: string = state === "pending" ? "Request open" : "Active loan";
    const variant: "warn" | "success" = state === "pending" ? "warn" : "success";
    return <Badge variant={variant} className="ml-2">{label}</Badge>;
  };

  const ItemInner = ({ id }: { id: string }) => (
    <Card className="flex items-center justify-between gap-4 px-5 py-4 transition-all duration-150 hover:border-primary/30 hover:bg-surface/80 hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <VaultIcon id={id} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-medium text-foreground break-all" title={id}>
            <span>{id}</span>
            {badge(stateFor(id))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-secondary-text">
        <CopyButton value={id} title={copied === id ? "Copied" : "Copy"} />
        <span aria-hidden className="hidden sm:inline">Open</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="h-4 w-4"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );

  return (
    <ul className="space-y-3">
      {vaultIds.map((id) => (
        <li key={id}>
          {onVaultClick ? (
            <button
              type="button"
              className="group w-full text-left focus:outline-none"
              onClick={() => onVaultClick?.(id)}
            >
              <ItemInner id={id} />
            </button>
          ) : (
            <Link
              href={`/dashboard/vault/${encodeURIComponent(id)}`}
              className="group block focus:outline-none"
              title={id}
              prefetch
            >
              <ItemInner id={id} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
