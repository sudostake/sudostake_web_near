"use client";

import React from "react";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { Summary } from "./Summary";

type Props = {
  loading: boolean;
  error: string | null;
  summary?: DelegationSummaryEntry[];
  refetch: () => void;
  availableBalance?: Balance | null;
  availableLoading?: boolean;
};

/**
 * Renders the vault's delegation summary and controls.
 */
export function DelegationsCard({
  loading,
  error,
  summary,
  refetch,
  availableBalance,
  availableLoading,
}: Props) {
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
        entries={summary}
        availableBalance={availableBalance}
        availableLoading={availableLoading}
      />

    </section>
  );
}
