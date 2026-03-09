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
  expiryDate: Date | null;
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

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className="text-xl font-mono text-foreground">{value}</div>
      {note ? <p className="text-xs text-secondary-text">{note}</p> : null}
    </div>
  );
}

export function LiquidationStatusSection({
  role,
  expiryDate,
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
  const canProcess = role === "activeLender" || role === "owner";
  const recoveredLabel = `${safeFormatYoctoNear(liquidatedYocto, 5)} NEAR`;
  const readyNowLabel = `${claimableNowLabel} NEAR`;
  const stillUnlockingLabel = unbondingTotalLabel ? `${unbondingTotalLabel} NEAR` : null;
  const remainingLabel = `${remainingTargetLabel ?? "0"} NEAR`;
  const summaryText = isActiveLender
    ? expiryDate
      ? `Expired ${formatDateTime(expiryDate)}. Claims are paid from vault balance and validator unlocks.`
      : "Loan expired. Claims are paid from vault balance and validator unlocks."
    : expiryDate
      ? `Expired ${formatDateTime(expiryDate)}. Vault NEAR is covering the lender claim.`
      : "Vault NEAR is covering the lender claim.";
  const headline = hasClaimableNow
    ? `${readyNowLabel} available now`
    : stillUnlockingLabel
      ? `${stillUnlockingLabel} unlocking`
      : "Waiting for NEAR to unlock";
  const unlockingNote = stillUnlockingLabel
    ? `${stillUnlockingLabel} still unlocking${longestEtaLabel ? ` · ETA ${longestEtaLabel}` : ""}`
    : null;

  return (
    <section className="space-y-4" role="region" aria-label="Liquidation status">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{headline}</p>
            <p className="max-w-3xl text-sm text-secondary-text">{summaryText}</p>
          </div>

          {canProcess && (
            <Button
              type="button"
              onClick={onProcess}
              disabled={processPending || !hasClaimableNow}
              size="sm"
              className="w-full justify-center sm:w-auto"
              title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
              aria-busy={processPending ? true : undefined}
            >
              {processPending ? STRINGS.processing : STRINGS.processNow}
            </Button>
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Metric label="Available" value={readyNowLabel} />
          <Metric label="Remaining" value={remainingLabel} />
          <Metric label="Paid" value={recoveredLabel} />
        </div>

        {unlockingNote ? (
          <p className="mt-4 border-t border-foreground/10 pt-4 text-sm text-secondary-text">{unlockingNote}</p>
        ) : null}

        {processError ? (
          <div
            className="mt-4 rounded-app border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3 text-sm text-secondary-text"
            role="alert"
          >
            {processError}
          </div>
        ) : null}
      </div>

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
