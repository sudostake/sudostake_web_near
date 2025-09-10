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
import { Input } from "@/app/components/ui/Input";

export type UserVaultsProps = {
  owner: string;
  factoryId: string;
  onVaultClick?: (vaultId: string) => void;
  onCreate?: () => void;
};

export function UserVaults({ owner, factoryId, onVaultClick, onCreate }: UserVaultsProps) {
  const { data, loading, error, refetch } = useUserVaults(owner, factoryId);
  const { data: summaries } = useUserVaultsSummaries(owner, factoryId);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const list = data ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((id) => id.toLowerCase().includes(q));
  }, [data, query]);

  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (loading || data === null) return <LoadingSpinner />;
  if ((data ?? []).length === 0)
    return <EmptyState owner={owner} factoryId={factoryId} onCreate={onCreate} />;

  return (
    <div>
      <SectionHeader
        className="mt-6"
        title="Your Vaults"
        caption={
          <>
            {(data ?? []).length} vault{(data ?? []).length === 1 ? "" : "s"}
          </>
        }
        right={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="sr-only" htmlFor="vault-search">Search vaults</label>
            <Input
              id="vault-search"
              type="text"
              inputMode="search"
              placeholder="Search vaults"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:w-64"
            />
            <CreateVaultButton className="shrink-0" onClick={onCreate} />
          </div>
        }
      />
      {query && filtered.length === 0 ? (
        <div className="text-sm text-secondary-text mt-3">No vaults match “{query}”.</div>
      ) : null}
      <div className="mt-2">
        <VaultList
          vaultIds={filtered}
          onVaultClick={onVaultClick}
          summaries={summaries ?? undefined}
        />
      </div>
    </div>
  );
}
