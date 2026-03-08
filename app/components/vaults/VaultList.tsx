"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/app/components/ui/Badge";
import { CopyButton } from "@/app/components/ui/CopyButton";
import { useState } from "react";
import { VaultIcon } from "@/app/components/vaults/VaultIcon";
import { buildVaultHref } from "@/app/components/navigationRoutes";

export type VaultSummary = { id: string; state: "idle" | "pending" | "active" };
export type VaultListProps = {
  vaultIds: string[];
  onVaultClick?: (vaultId: string) => void;
  summaries?: VaultSummary[];
};

export function VaultList({ vaultIds, onVaultClick, summaries }: VaultListProps) {
  const [copied] = useState<string | null>(null);
  const pathname = usePathname();

  const baseRowClasses =
    "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5";
  const interactiveRowClasses = [
    "rounded-2xl border border-[color:color-mix(in_oklab,var(--border)_58%,transparent)] bg-transparent",
    "transition-[border-color,background-color,color] duration-200",
    "hover:border-primary/35 hover:bg-[color:var(--surface-muted)]",
    "group-hover:border-primary/35 group-hover:bg-[color:var(--surface-muted)]",
    "group-focus-visible:border-primary/45 group-focus-visible:bg-[color:var(--surface-muted)]",
  ].join(" ");

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
    <div className={`${baseRowClasses} ${interactiveRowClasses}`}>
      <div className="flex min-w-0 items-center gap-3">
        <VaultIcon id={id} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 break-all font-medium text-foreground" title={id}>
            <span>{id}</span>
            {badge(stateFor(id))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center gap-3 text-sm text-secondary-text sm:w-auto sm:justify-end">
        <CopyButton value={id} title={copied === id ? "Copied" : "Copy"} />
        <span aria-hidden="true" className="hidden text-xs font-medium uppercase tracking-wide text-secondary-text sm:inline">
          Open
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <ul className="space-y-2.5">
      {vaultIds.map((id) => (
        <li key={id}>
          {onVaultClick ? (
            <button
              type="button"
              className="group w-full text-left focus:outline-none focus-visible:outline-none"
              onClick={() => onVaultClick?.(id)}
            >
              <ItemInner id={id} />
            </button>
          ) : (
            <Link
              href={buildVaultHref(id, pathname)}
              className="group block focus:outline-none focus-visible:outline-none"
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
