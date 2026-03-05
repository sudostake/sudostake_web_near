"use client";

import React from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { CreateVaultButton } from "../CreateVaultButton";
import { useUserVaults } from "@/hooks/useUserVaults";
import { useUserVaultsSummaries } from "@/hooks/useUserVaultsSummaries";
import { SectionHeader } from "@/app/components/ui/SectionHeader";

export type UserVaultsProps = {
  owner: string;
  factoryId: string;
  onVaultClick?: (vaultId: string) => void;
  onCreate?: () => void;
  headerMode?: "full" | "toolsOnly"; // toolsOnly renders just optional action controls
  showCreateButton?: boolean;
};

export function UserVaults({
  owner,
  factoryId,
  onVaultClick,
  onCreate,
  headerMode = "full",
  showCreateButton = true,
}: UserVaultsProps) {
  const { data, loading, error, refetch } = useUserVaults(owner, factoryId);
  const { data: summaries } = useUserVaultsSummaries(owner, factoryId);
  const vaultIds = data ?? [];
  const totalVaults = vaultIds.length;
  const listSpacingClass =
    headerMode === "toolsOnly" && !showCreateButton ? "mt-1 sm:mt-2" : "mt-3 sm:mt-4";

  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (loading || data === null) return <LoadingSpinner />;
  if ((data ?? []).length === 0)
    return <EmptyState owner={owner} factoryId={factoryId} onCreate={onCreate} />;

  const Controls = showCreateButton ? <CreateVaultButton className="shrink-0" onClick={onCreate} /> : null;

  return (
    <div>
      {headerMode === "full" ? (
        <SectionHeader
          className="mt-4 sm:mt-5"
          title="Your vaults"
          caption={<>{totalVaults} vault{totalVaults === 1 ? "" : "s"}</>}
          right={Controls ?? undefined}
        />
      ) : (
        Controls ? <div className="flex justify-end sm:mt-1">{Controls}</div> : null
      )}
      <div className={listSpacingClass}>
        <VaultList
          vaultIds={vaultIds}
          onVaultClick={onVaultClick}
          summaries={summaries ?? undefined}
        />
      </div>
    </div>
  );
}
