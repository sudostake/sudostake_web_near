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
  headerMode?: "full" | "toolsOnly"; // toolsOnly renders just the controls (search + create)
};

export function UserVaults({ owner, factoryId, onVaultClick, onCreate, headerMode = "full" }: UserVaultsProps) {
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

  const Controls = (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="vault-search">Search vaults</label>
      <Input
        id="vault-search"
        type="text"
        inputMode="search"
        placeholder="Search vaults"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        containerClassName="flex-1 min-w-0"
      />
      <CreateVaultButton className="shrink-0" onClick={onCreate} />
    </div>
  );

  return (
    <div>
      {headerMode === "full" ? (
        <SectionHeader
          className="mt-4 sm:mt-5"
          title="Your vaults"
          caption={<>{(data ?? []).length} vault{(data ?? []).length === 1 ? "" : "s"}</>}
          right={Controls}
        />
      ) : (
        <div className="mt-3 flex justify-end sm:mt-2">{Controls}</div>
      )}
      {query && filtered.length === 0 ? (
        <div className="mt-3 text-sm text-secondary-text">No vaults match “{query}”.</div>
      ) : null}
      <div className="mt-3 sm:mt-4">
        <VaultList
          vaultIds={filtered}
          onVaultClick={onVaultClick}
          summaries={summaries ?? undefined}
        />
      </div>
    </div>
  );
}
