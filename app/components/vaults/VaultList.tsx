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
    <Card className="flex items-center justify-between gap-3 hover:bg-background/70">
      <div className="flex items-center gap-3 min-w-0">
        <VaultIcon id={id} size="sm" />
        <div className="min-w-0">
          <div className="font-medium truncate" title={id}>
            {id}
            {badge(stateFor(id))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <CopyButton value={id} title={copied === id ? "Copied" : "Copy"} />
        <span aria-hidden className="text-secondary-text">|</span>
        <span aria-hidden className="text-secondary-text hidden sm:inline text-sm">Open</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-4 w-4 ml-1"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );

  return (
    <ul className="space-y-2">
      {vaultIds.map((id) => (
        <li key={id}>
          {onVaultClick ? (
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onVaultClick?.(id)}
            >
              <ItemInner id={id} />
            </button>
          ) : (
            <Link
              href={`/dashboard/vault/${encodeURIComponent(id)}`}
              className="block"
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
