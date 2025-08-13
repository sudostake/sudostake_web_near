"use client";

import React from "react";
import Link from "next/link";

export type VaultListProps = {
  vaultIds: string[];
  onVaultClick?: (vaultId: string) => void;
};

export function VaultList({ vaultIds, onVaultClick }: VaultListProps) {
  return (
    <ul className="space-y-2">
      {vaultIds.map((id) => (
        <li key={id}>
          {onVaultClick ? (
            <button
              type="button"
              className="w-full text-left p-2 bg-surface rounded hover:bg-surface/90 truncate"
              title={id}
              onClick={() => onVaultClick?.(id)}
            >
              {id}
            </button>
          ) : (
            <Link
              href={`/dashboard/vault/${encodeURIComponent(id)}`}
              className="block p-2 bg-surface rounded hover:bg-surface/90 truncate"
              title={id}
              prefetch
            >
              {id}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
