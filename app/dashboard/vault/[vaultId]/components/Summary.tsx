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
  const helperMessage = React.useMemo(() => {
    const canAct = Boolean(onDelegate || onDeposit);
    if (availableLoading && canAct) return "Checking your available balance...";
    if (showDelegateCta) return "Delegate your available balance to validators to start earning rewards.";
    if (showDepositCta) return "Deposit NEAR to your vault and then delegate to validators to start earning rewards.";
    return "The owner can delegate to validators to start earning rewards.";
  }, [availableLoading, onDelegate, onDeposit, showDelegateCta, showDepositCta]);
  return (
    <Card className="border border-dashed border-foreground/10 bg-surface-muted/60" role="region" aria-label="Delegation onboarding">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">Get started with delegations</div>
        <p className="text-sm text-secondary-text">
          You do not have any delegations yet. {helperMessage}
        </p>
        {availableLoading && (onDelegate || onDeposit) ? (
          <div className="h-9 w-40 animate-pulse rounded-full bg-foreground/10" />
        ) : showDelegateCta ? (
          <Button onClick={() => onDelegate?.()} className="w-full justify-center gap-2 sm:w-auto">
            Get started with delegating
          </Button>
        ) : showDepositCta ? (
          <Button onClick={onDeposit} className="w-full justify-center gap-2 sm:w-auto">
            Deposit to vault
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
