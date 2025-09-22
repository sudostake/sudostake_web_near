"use client";

import React from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Input } from "@/app/components/ui/Input";
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
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const list = (data ?? []).map((d) => d.id);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((id) => id.toLowerCase().includes(q));
  }, [data, query]);

  if (!lender || !factoryId) return null;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (loading || data === null) return <LoadingSpinner />;
  if ((data ?? []).length === 0)
    return headerMode === "toolsOnly" ? (
      <div className="mt-6 text-sm text-secondary-text">You have no active lending positions.</div>
    ) : (
      <div className="mt-6">
        <SectionHeader title="Your Lending Positions" caption={<>0 positions</>} />
        <div className="text-sm text-secondary-text mt-3">You have no active lending positions.</div>
      </div>
    );

  const Controls = (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <label className="sr-only" htmlFor="lender-search">Search positions</label>
      <Input
        id="lender-search"
        type="text"
        inputMode="search"
        placeholder="Search positions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sm:w-64"
      />
    </div>
  );

  return (
    <div>
      {headerMode === "full" ? (
        <SectionHeader
          className="mt-8"
          title="Your Lending Positions"
          caption={<>{(data ?? []).length} position{(data ?? []).length === 1 ? "" : "s"}</>}
          right={Controls}
        />
      ) : (
        <div className="mt-6 flex items-center justify-end">{Controls}</div>
      )}
      {query && filtered.length === 0 ? (
        <div className="text-sm text-secondary-text mt-3">No positions match “{query}”.</div>
      ) : null}
      <div className="mt-2">
        <VaultList
          vaultIds={filtered}
          onVaultClick={onVaultClick}
          summaries={(data ?? []).map((d) => ({ id: d.id, state: d.state ?? DEFAULT_VAULT_STATE }))}
        />
      </div>
    </div>
  );
}
