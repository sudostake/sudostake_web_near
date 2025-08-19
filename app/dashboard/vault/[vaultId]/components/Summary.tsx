"use client";

import React from "react";
import { DelegationsSummary } from "./DelegationsSummary";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";

type Props = {
  loading: boolean;
  entries?: DelegationSummaryEntry[];
  onDeposit?: () => void;
  onDelegate?: () => void;
  onUndelegate?: (validator: string) => void;
  onUnclaimUnstaked?: (validator: string) => void;
  availableBalance?: Balance | null;
  availableLoading?: boolean;
};

export function Summary({
  loading,
  entries,
  onDeposit,
  onDelegate,
  onUndelegate,
  onUnclaimUnstaked,
  availableBalance,
  availableLoading,
}: Props) {
  return (
    <div className="px-4 py-3">
      <div className="text-sm text-secondary-text mb-2">Summary</div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-5 rounded bg-background/60 w-1/2" />
          <div className="h-5 rounded bg-background/60 w-2/3" />
          <div className="h-5 rounded bg-background/60 w-1/3" />
        </div>
      ) : entries && entries.length > 0 ? (
        <DelegationsSummary
          entries={entries}
          onDelegate={onDelegate}
          onUndelegate={onUndelegate}
          onUnclaimUnstaked={onUnclaimUnstaked}
        />
      ) : (
        <OnboardingEmptyState
          onDeposit={onDeposit}
          onDelegate={onDelegate}
          availableBalance={availableBalance}
          availableLoading={availableLoading}
        />
      )}
    </div>
  );
}

function OnboardingEmptyState({
  onDeposit,
  onDelegate,
  availableBalance,
  availableLoading,
}: {
  onDeposit?: () => void;
  onDelegate?: () => void;
  availableBalance?: Balance | null;
  availableLoading?: boolean;
}) {
  const parsed = parseNumber(availableBalance?.toDisplay() ?? "");
  const available = Number.isNaN(parsed) ? 0 : parsed;
  const showDelegateCta = !availableLoading && available > 0;
  return (
    <div className="rounded border border-dashed bg-background/40 p-4">
      <div className="text-sm font-medium">Get started with delegations</div>
      <p className="mt-1 text-sm text-secondary-text">
        You do not have any delegations yet.
        {" "}
        {availableLoading
          ? "Checking your available balance..."
          : showDelegateCta
          ? "Delegate your available balance to validators to start earning rewards."
          : "Deposit NEAR to your vault and then delegate to validators to start earning rewards."}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {availableLoading ? (
          <div className="h-8 w-40 rounded bg-background animate-pulse" />
        ) : showDelegateCta ? (
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-1.5 px-3 text-sm disabled:opacity-60"
            onClick={onDelegate}
            disabled={!onDelegate}
          >
            Get started with delegating
          </button>
        ) : (
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-1.5 px-3 text-sm disabled:opacity-60"
            onClick={onDeposit}
            disabled={!onDeposit}
          >
            Deposit to vault
          </button>
        )}
      </div>
    </div>
  );
}
