"use client";

import React from "react";
import { DelegationsSummary } from "./DelegationsSummary";
import { useDelegationsActions } from "./DelegationsActionsContext";
import { parseNumber } from "@/utils/format";
import type { DelegationSummaryEntry } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

type Props = {
  loading: boolean;
  entries?: DelegationSummaryEntry[];
  availableBalance?: Balance | null;
  availableLoading?: boolean;
};

export function Summary({
  loading,
  entries,
  availableBalance,
  availableLoading,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2 py-3">
        <div className="h-5 w-1/2 rounded-full bg-foreground/10" />
        <div className="h-5 w-2/3 rounded-full bg-foreground/10" />
        <div className="h-5 w-1/3 rounded-full bg-foreground/10" />
      </div>
    );
  }

  if (entries && entries.length > 0) {
    return <DelegationsSummary entries={entries} />;
  }

  return <OnboardingEmptyState availableBalance={availableBalance} availableLoading={availableLoading} />;
}

function OnboardingEmptyState({
  availableBalance,
  availableLoading,
}: {
  availableBalance?: Balance | null;
  availableLoading?: boolean;
}) {
  const { onDeposit, onDelegate } = useDelegationsActions();
  const parsed = parseNumber(availableBalance?.toDisplay() ?? "");
  const available = Number.isNaN(parsed) ? 0 : parsed;
  const showDelegateCta = !availableLoading && available > 0 && Boolean(onDelegate);
  const showDepositCta = Boolean(onDeposit) && !showDelegateCta;
  const statusLabel = React.useMemo(() => {
    const canAct = Boolean(onDelegate || onDeposit);
    if (availableLoading && canAct) return "Checking balance";
    if (showDelegateCta) return "Liquid NEAR ready";
    if (showDepositCta) return "Deposit required";
    return "Owner action required";
  }, [availableLoading, onDelegate, onDeposit, showDelegateCta, showDepositCta]);
  return (
    <Card className="rounded-2xl border border-dashed border-foreground/10 bg-surface-muted/60 px-4 py-4" role="region" aria-label="Delegation onboarding">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">No delegations</div>
          <p className="text-xs text-secondary-text">{statusLabel}</p>
        </div>
        {availableLoading && (onDelegate || onDeposit) ? (
          <div className="h-9 w-40 animate-pulse rounded-full bg-foreground/10" />
        ) : showDelegateCta ? (
          <Button onClick={() => onDelegate?.()} className="w-full justify-center gap-2 sm:w-auto">
            Get started with delegating
          </Button>
        ) : showDepositCta ? (
          <Button onClick={onDeposit} className="w-full justify-center gap-2 sm:w-auto">
            Deposit
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
