"use client";

import React, { useEffect, useState, useCallback } from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { CreateVaultButton } from "../CreateVaultButton";

export type UserVaultsProps = {
  owner: string;
  factoryId: string;
  onVaultClick?: (vaultId: string) => void;
  onCreate?: () => void;
};

export function UserVaults({ owner, factoryId, onVaultClick, onCreate }: UserVaultsProps) {
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
    return <EmptyState owner={owner} factoryId={factoryId} onCreate={onCreate} />;
  return (
    <div>
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">Your Vaults</h2>
        <CreateVaultButton onClick={onCreate} />
      </div>
      <div className="text-sm text-secondary-text mt-2 mb-2">
        You have {vaultIds.length} vault{vaultIds.length === 1 ? '' : 's'}
      </div>
      <VaultList vaultIds={vaultIds} onVaultClick={onVaultClick} />
    </div>
  );
}
