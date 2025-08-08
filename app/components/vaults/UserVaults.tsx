"use client";

import React, { useEffect, useState, useCallback } from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";

export type UserVaultsProps = {
  owner: string;
  factoryId: string;
  onVaultClick?: (vaultId: string) => void;
};

export function UserVaults({ owner, factoryId, onVaultClick }: UserVaultsProps) {
  const [vaultIds, setVaultIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = useCallback(async () => {
    setError(null);
    setVaultIds(null);
    try {
      const res = await fetch(
        `/api/get_user_vaults?owner=${encodeURIComponent(owner)}&factory_id=${encodeURIComponent(
          factoryId
        )}`
      );
      const data = await res.json();
      if (!res.ok) {
        const apiError =
          data.error
            ? String(data.error)
            : `Failed to fetch vaults: ${res.status} ${res.statusText}`;
        throw new Error(apiError);
      }
      setVaultIds(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [owner, factoryId]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  if (error) return <ErrorMessage message={error} onRetry={fetchVaults} />;
  if (vaultIds === null) return <LoadingSpinner />;
  if (vaultIds.length === 0)
    return <EmptyState owner={owner} factoryId={factoryId} />;
  return <VaultList vaultIds={vaultIds} onVaultClick={onVaultClick} />;
}
