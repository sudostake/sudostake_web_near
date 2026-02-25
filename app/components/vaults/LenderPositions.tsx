"use client";

import React from "react";
import { VaultList } from "./VaultList";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Input } from "@/app/components/ui/Input";
import { useLenderPositions } from "@/hooks/useLenderPositions";
import { DEFAULT_VAULT_STATE } from "@/utils/constants";
import { Button } from "@/app/components/ui/Button";

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
  const totalPositions = (data ?? []).length;
  const hasQuery = query.trim().length > 0;

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

  const Controls = (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="lender-search">Search positions</label>
      <Input
        id="lender-search"
        type="text"
        inputMode="search"
        placeholder="Search positions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9"
        containerClassName="flex-1 min-w-0"
      />
      {hasQuery && (
        <Button type="button" variant="secondary" size="sm" onClick={() => setQuery("")} className="shrink-0">
          Clear
        </Button>
      )}
    </div>
  );

  return (
    <div>
      {headerMode === "full" ? (
      <SectionHeader
        className="mt-8"
        title="Your positions"
        caption={<>{(data ?? []).length} position{(data ?? []).length === 1 ? "" : "s"}</>}
        right={Controls}
      />
      ) : (
        <div className="space-y-2">
          <div className="mt-1 flex items-center justify-end">{Controls}</div>
          <p className="text-xs text-secondary-text">
            Showing {filtered.length} of {totalPositions} position{totalPositions === 1 ? "" : "s"}.
          </p>
        </div>
      )}
      {query && filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-3 text-sm text-secondary-text">
          No positions match &quot;{query}&quot;.
        </div>
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
