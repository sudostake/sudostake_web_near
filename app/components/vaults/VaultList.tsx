"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";

export type VaultListProps = {
  vaultIds: string[];
  onVaultClick?: (vaultId: string) => void;
};

export function VaultList({ vaultIds, onVaultClick }: VaultListProps) {
  const [copied, setCopied] = useState<string | null>(
    null,
  );

  const copy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(id);
      setTimeout(() => setCopied((prev) => (prev === id ? null : prev)), 1200);
    } catch {}
  };

  const initials = (id: string) => {
    // Use first two visible characters before a dot if possible
    const base = id.split(".")[0] || id;
    return base.slice(0, 2).toUpperCase();
  };

  const ItemInner = ({ id }: { id: string }) => (
    <div className="flex items-center justify-between gap-3 rounded border bg-surface hover:bg-surface/90 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium"
        >
          {initials(id)}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate" title={id}>
            {id}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          aria-label="Copy vault ID"
          title={copied === id ? "Copied" : "Copy"}
          className="rounded p-1 hover:bg-background/60"
          onClick={(e) => copy(e, id)}
        >
          {/* Copy icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
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
    </div>
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
