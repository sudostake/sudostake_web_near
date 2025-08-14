"use client";

import React from "react";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { Summary } from "./Summary";

type Props = {
  factoryId?: string | null;
  vaultId?: string | null;
  onDeposit?: () => void;
  onDelegate?: () => void;
  availableBalance?: string | null;
  availableLoading?: boolean;
};

export function DelegationsCard({ factoryId, vaultId, onDeposit, onDelegate, availableBalance, availableLoading }: Props) {
  const { data, loading, error, refetch } = useVaultDelegations(factoryId, vaultId);

  return (
    <section className="rounded border bg-surface">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-base font-medium">Delegations</h2>
        <div className="text-xs text-secondary-text">
          {loading ? "Loading…" : <button className="underline" onClick={refetch}>Refresh</button>}
        </div>
      </header>

      {error && (
        <div className="px-4 py-3 text-sm text-red-500" role="alert">
          Failed to load delegations
          <div className="text-xs opacity-80 mt-1">{error}</div>
        </div>
      )}

      <Summary
        loading={loading}
        entries={data?.summary}
        onDeposit={onDeposit}
        onDelegate={onDelegate}
        availableBalance={availableBalance}
        availableLoading={availableLoading}
      />

    </section>
  );
}
