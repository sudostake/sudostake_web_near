"use client";

import React from "react";

export type VaultListProps = {
  vaultIds: string[];
  onVaultClick?: (vaultId: string) => void;
};

export function VaultList({ vaultIds, onVaultClick }: VaultListProps) {
  return (
    <ul className="space-y-2">
      {vaultIds.map((id) => (
        <li key={id}>
          <button
            className="w-full text-left p-2 bg-surface rounded hover:bg-surface/90"
            onClick={() => onVaultClick?.(id)}
          >
            {id}
          </button>
        </li>
      ))}
    </ul>
  );
}
