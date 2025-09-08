"use client";

import React from "react";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { Summary } from "./Summary";
import { STRINGS } from "@/utils/strings";

type Props = {
  loading: boolean;
  error: string | null;
  summary?: DelegationSummaryEntry[];
  refetch: () => void;
  availableBalance?: Balance | null;
  availableLoading?: boolean;
  refundsCount?: number;
  refundsLoading?: boolean;
  onRefreshRefunds?: () => void;
  showClaimDisabledNote?: boolean;
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
  refundsCount,
  refundsLoading,
  onRefreshRefunds,
  showClaimDisabledNote,
}: Props) {
  return (
    <section className="rounded border bg-surface">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-base font-medium">Delegations</h2>
        <div className="text-xs text-secondary-text">
          {loading || refundsLoading ? (
            "Loading…"
          ) : (
            <button
              className="underline"
              onClick={() => {
                refetch();
                onRefreshRefunds?.();
              }}
            >
              Refresh
            </button>
          )}
        </div>
      </header>

      {showClaimDisabledNote && (
        <div className="px-4 pt-3">
          <div className="rounded border border-red-400/30 bg-red-50 text-red-900 p-2 text-sm">
            {STRINGS.claimDisabledLiquidation}
          </div>
        </div>
      )}

      {typeof refundsCount === "number" && refundsCount > 0 && (
        <div className="px-4 pt-3">
          <div className="rounded border border-amber-400/30 bg-amber-100/60 text-amber-900 p-2 text-sm">
            <span className="font-medium">{STRINGS.pendingRefunds}:</span> {refundsCount}. {STRINGS.refundsAffectDelegation}
          </div>
        </div>
      )}

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
