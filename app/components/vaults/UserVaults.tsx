"use client";

import React from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { CreateVaultButton } from "../CreateVaultButton";
import { useUserVaults } from "@/hooks/useUserVaults";

export type UserVaultsProps = {
  owner: string;
  factoryId: string;
  onVaultClick?: (vaultId: string) => void;
  onCreate?: () => void;
};

export function UserVaults({ owner, factoryId, onVaultClick, onCreate }: UserVaultsProps) {
  const { data, loading, error, refetch } = useUserVaults(owner, factoryId);

  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (loading || data === null) return <LoadingSpinner />;
  if (data.length === 0)
    return <EmptyState owner={owner} factoryId={factoryId} onCreate={onCreate} />;
  return (
    <div>
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">Your Vaults</h2>
        <CreateVaultButton onClick={onCreate} />
      </div>
      <div className="text-sm text-secondary-text mt-2 mb-2">
        You have {data.length} vault{data.length === 1 ? '' : 's'}
      </div>
      <VaultList vaultIds={data} onVaultClick={onVaultClick} />
    </div>
  );
}
