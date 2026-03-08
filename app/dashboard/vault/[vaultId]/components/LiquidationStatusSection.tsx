"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS } from "@/utils/strings";
import { formatDateTime } from "@/utils/datetime";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Button } from "@/app/components/ui/Button";
import { UnbondingStatusCard } from "./UnbondingStatusCard";
import type { UnbondingEntryRow } from "./UnbondingList";

type Props = {
  role: ViewerRole;
  isOwner: boolean;
  expiryDate: Date | null;
  ownerLiquidationSummary: string;
  liquidatedYocto: string;
  remainingTargetLabel: string | null;
  collateralLabel: string | null;
  claimableNowLabel: string;
  hasClaimableNow: boolean;
  expectedImmediateYocto: bigint;
  maturedYocto: bigint;
  maturedTotalLabel: string | null;
  processPending: boolean;
  processError: string | null;
  onProcess: () => void;
  unbondingTotalLabel: string | null;
  unbondingEntries?: UnbondingEntryRow[] | null;
  showDetails: boolean;
  onToggleDetails: () => void;
  longestEtaLabel: string | null;
};

function Stat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className={`${emphasize ? "text-lg" : "text-sm"} font-mono text-foreground`}>{value}</div>
    </div>
  );
}

export function LiquidationStatusSection({
  role,
  isOwner,
  expiryDate,
  ownerLiquidationSummary,
  liquidatedYocto,
  remainingTargetLabel,
  collateralLabel,
  claimableNowLabel,
  hasClaimableNow,
  expectedImmediateYocto,
  maturedYocto,
  maturedTotalLabel,
  processPending,
  processError,
  onProcess,
  unbondingTotalLabel,
  unbondingEntries,
  showDetails,
  onToggleDetails,
  longestEtaLabel,
}: Props) {
  const isActiveLender = role === "activeLender";
  const recoveredLabel = `${safeFormatYoctoNear(liquidatedYocto, 5)} NEAR`;
  const readyNowLabel = `${claimableNowLabel} NEAR`;
  const vaultBalanceLabel = `${safeFormatYoctoNear(expectedImmediateYocto.toString(), 5)} NEAR`;
  const maturedNowLabel = `${maturedTotalLabel ?? safeFormatYoctoNear(maturedYocto.toString(), 5)} NEAR`;
  const stillUnlockingLabel = `${unbondingTotalLabel ?? "0"} NEAR`;
  const remainingLabel = `${remainingTargetLabel ?? "0"} NEAR`;
  const summaryText = isActiveLender
    ? expiryDate
      ? `Loan expired on ${formatDateTime(expiryDate)}. Liquidation now repays you from vault balance and validator unlocks.`
      : "Loan expired. Liquidation now repays you from vault balance and validator unlocks."
    : ownerLiquidationSummary;
  const statusText = hasClaimableNow
    ? isActiveLender
      ? `${readyNowLabel} is ready now. ${vaultBalanceLabel} is already in the vault${maturedYocto > BigInt(0) ? ` and ${maturedNowLabel} has matured at validators.` : "."}`
      : `${readyNowLabel} is ready now for the lender. ${vaultBalanceLabel} is already in the vault${maturedYocto > BigInt(0) ? ` and ${maturedNowLabel} has matured at validators.` : "."}`
    : unbondingTotalLabel
      ? `Nothing is claimable yet. ${stillUnlockingLabel} is still unlocking${longestEtaLabel ? ` and the longest ETA is ${longestEtaLabel}` : ""}.`
      : "Nothing is claimable yet.";

  return (
    <section className="space-y-5" role="region" aria-label="Liquidation status">
      <div className="space-y-1">
        <p className="text-sm text-secondary-text">{summaryText}</p>
      </div>

      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Paid out" value={recoveredLabel} emphasize />
        <Stat label="Claimable now" value={readyNowLabel} emphasize />
        <Stat label="Unlocking" value={stillUnlockingLabel} emphasize />
        <Stat label="Remaining" value={remainingLabel} emphasize />
      </div>

      <div className="border-t border-foreground/10 pt-4">
        <p className="text-sm text-secondary-text">
          {statusText}
          {collateralLabel ? ` Original target: ${collateralLabel} NEAR.` : ""}
        </p>
      </div>

      {(isActiveLender || isOwner) && (
        <div className="space-y-2 border-t border-foreground/10 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              onClick={onProcess}
              disabled={processPending || !hasClaimableNow}
              size="sm"
              className="w-full justify-center sm:w-auto"
              title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
              aria-busy={processPending ? true : undefined}
            >
              {processPending ? STRINGS.processing : "Process available NEAR"}
            </Button>
          </div>
          {processError ? (
            <div className="text-sm text-red-600" role="alert">
              {processError}
            </div>
          ) : null}
        </div>
      )}

      {unbondingTotalLabel && (
        <UnbondingStatusCard
          open={showDetails}
          onToggle={onToggleDetails}
          count={unbondingEntries?.length ?? 0}
          totalLabel={unbondingTotalLabel}
          etaLabel={longestEtaLabel}
          entries={unbondingEntries ?? []}
          footnote={isActiveLender ? STRINGS.unbondingFootnoteLender : STRINGS.unbondingFootnoteOwner}
        />
      )}
    </section>
  );
}
