"use client";

import React from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { useLenderPositions } from "@/hooks/useLenderPositions";
import { DEFAULT_VAULT_STATE } from "@/utils/constants";

export type LenderPositionsProps = {
  lender: string | null | undefined;
  factoryId: string | null | undefined;
  onVaultClick?: (vaultId: string) => void;
  headerMode?: "full" | "toolsOnly";
};

export function LenderPositions({ lender, factoryId, onVaultClick, headerMode = "full" }: LenderPositionsProps) {
  const { data, loading, error, refetch } = useLenderPositions(lender, factoryId);
  const positionIds = (data ?? []).map((d) => d.id);
  const totalPositions = positionIds.length;
  const listSpacingClass = headerMode === "toolsOnly" ? "mt-1 sm:mt-2" : "mt-2";

  if (!lender || !factoryId) return null;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (loading || data === null) return <LoadingSpinner />;
  if ((data ?? []).length === 0)
    return headerMode === "toolsOnly" ? (
      <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 text-sm text-secondary-text">
        You have no active positions.
      </div>
    ) : (
      <div className="mt-6">
        <SectionHeader title="Your positions" caption={<>0 positions</>} />
        <div className="mt-3 text-sm text-secondary-text">You have no active positions.</div>
      </div>
    );

  return (
    <div>
      {headerMode === "full" ? (
      <SectionHeader
        className="mt-8"
        title="Your positions"
        caption={<>{totalPositions} position{totalPositions === 1 ? "" : "s"}</>}
      />
      ) : null}
      <div className={listSpacingClass}>
        <VaultList
          vaultIds={positionIds}
          onVaultClick={onVaultClick}
          summaries={(data ?? []).map((d) => ({ id: d.id, state: d.state ?? DEFAULT_VAULT_STATE }))}
        />
      </div>
    </div>
  );
}
