"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS } from "@/utils/strings";
import { formatDateTime } from "@/utils/datetime";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
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

function StatCard({
  label,
  value,
  note,
  emphasize = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  emphasize?: boolean;
  tone?: "neutral" | "info" | "warn" | "success";
}) {
  const toneClass =
    tone === "info"
      ? "border-primary/20 bg-primary/5"
      : tone === "warn"
        ? "border-amber-300/60 bg-amber-50/70"
        : tone === "success"
          ? "border-emerald-300/60 bg-emerald-50/70"
          : "border-[color:var(--border)] bg-[color:var(--surface-muted)]";

  return (
    <div className={`space-y-2 rounded-2xl border px-4 py-4 ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">{label}</div>
      <div className={`${emphasize ? "text-xl" : "text-sm"} font-mono text-foreground`}>{value}</div>
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
  const vaultBalanceLabel = `${safeFormatYoctoNear(expectedImmediateYocto.toString(), 5)} NEAR`;
  const maturedNowLabel = `${maturedTotalLabel ?? safeFormatYoctoNear(maturedYocto.toString(), 5)} NEAR`;
  const stillUnlockingLabel = `${unbondingTotalLabel ?? "0"} NEAR`;
  const remainingLabel = `${remainingTargetLabel ?? "0"} NEAR`;
  const summaryText = isActiveLender
    ? expiryDate
      ? `Expired ${formatDateTime(expiryDate)}. Payouts come from vault balance and validator unlocks.`
      : "Loan expired. Payouts come from vault balance and validator unlocks."
    : expiryDate
      ? `Expired ${formatDateTime(expiryDate)}. NEAR is covering the lender's claim.`
      : "Liquidation is using vault NEAR to cover the lender's claim.";
  const compactStatusText = hasClaimableNow
    ? isActiveLender
      ? "Process the amount already available."
      : "The lender can process the amount already available."
    : unbondingTotalLabel
      ? `${stillUnlockingLabel} still unlocking${longestEtaLabel ? ` · ETA ${longestEtaLabel}` : ""}`
      : "Nothing claimable yet.";
  const statusVariant = hasClaimableNow ? "success" : unbondingTotalLabel ? "warn" : "neutral";
  const statusLabel = hasClaimableNow ? "Ready to process" : unbondingTotalLabel ? "Unlocking" : "Waiting";
  const statusHeadline = hasClaimableNow
    ? `${readyNowLabel} ready now`
    : unbondingTotalLabel
      ? "Liquidation is waiting on validator unlocks"
      : "No NEAR is ready to process yet";
  const remainingNote = collateralLabel ? `Target ${collateralLabel}` : "Ends at 0";
  const sourceSummary = `Vault ${vaultBalanceLabel} · Matured ${maturedNowLabel}`;

  return (
    <section className="space-y-5" role="region" aria-label="Liquidation status">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">{statusHeadline}</p>
              <p className="max-w-3xl text-sm text-secondary-text">{summaryText}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 lg:min-w-[15rem]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">Remaining</div>
            <div className="mt-2 text-2xl font-mono text-foreground">{remainingLabel}</div>
            <p className="mt-2 text-xs text-secondary-text">{remainingNote}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
        <StatCard
          label="Paid"
          value={recoveredLabel}
          emphasize
        />
        <StatCard
          label="Ready now"
          value={readyNowLabel}
          note={hasClaimableNow ? "Processable now" : undefined}
          emphasize
          tone={hasClaimableNow ? "success" : "neutral"}
        />
        <StatCard
          label="Unlocking"
          value={stillUnlockingLabel}
          note={longestEtaLabel ? `ETA ${longestEtaLabel}` : undefined}
          emphasize
          tone={unbondingTotalLabel ? "warn" : "neutral"}
        />
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-secondary-text">{compactStatusText}</p>
            <p className="text-xs text-secondary-text">Ready now split: {sourceSummary}</p>
          </div>

          {canProcess && (
            <div className="space-y-2 lg:text-right">
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
              {processError ? (
                <div className="text-sm text-red-600" role="alert">
                  {processError}
                </div>
              ) : null}
            </div>
          )}
        </div>
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
