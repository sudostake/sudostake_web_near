"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS } from "@/utils/strings";
import { formatDateTime } from "@/utils/datetime";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
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

type LiquidationPayoutCardProps = {
  liquidatedYocto: string;
  remainingTargetLabel: string | null;
  collateralLabel: string | null;
  claimableNowLabel: string;
  hasClaimableNow: boolean;
  expectedImmediateYocto: bigint;
  maturedYocto: bigint;
  maturedTotalLabel: string | null;
  className?: string;
};

function LiquidationPayoutCard({
  liquidatedYocto,
  remainingTargetLabel,
  collateralLabel,
  claimableNowLabel,
  hasClaimableNow,
  expectedImmediateYocto,
  maturedYocto,
  maturedTotalLabel,
  className,
}: LiquidationPayoutCardProps) {
  const hasVaultBalanceNow = expectedImmediateYocto > BigInt(0);
  const hasMaturedNow = maturedYocto > BigInt(0);
  return (
    <Card className={["rounded-lg border border-white/10 bg-background/70 px-4 py-3", className].filter(Boolean).join(" ")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-secondary-text">{STRINGS.paidSoFar}</div>
          <div className="font-medium">{safeFormatYoctoNear(liquidatedYocto, 5)} NEAR</div>
        </div>
        {remainingTargetLabel && (
          <div>
            <div className="text-secondary-text">{STRINGS.remainingLabel}</div>
            <div className="font-medium">{remainingTargetLabel} NEAR{collateralLabel ? ` (Target: ${collateralLabel} NEAR)` : ""}</div>
          </div>
        )}
      </div>
      <div className="my-2 h-px bg-foreground/10" />
      <div className="text-sm">
        <div className="text-secondary-text">{STRINGS.nextPayoutSources}</div>
        <div className="mt-1">
          {hasClaimableNow ? (
            <div className="font-medium">{claimableNowLabel} NEAR {STRINGS.availableNow.toLowerCase()}</div>
          ) : (
            <div className="text-secondary-text">{STRINGS.nothingAvailableNow}</div>
          )}
          <ul className="mt-2 space-y-1">
            <li className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 ${hasVaultBalanceNow ? "text-primary/90" : "text-foreground/40"}`}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="2" y="6" width="12" height="6" rx="2" />
                  <rect x="4" y="4" width="8" height="3" rx="1.5" />
                  <circle cx="6" cy="9" r="0.6" />
                  <circle cx="10" cy="9" r="0.6" />
                </svg>
                <span className="text-secondary-text">{STRINGS.sourceVaultBalanceNow}</span>
                {hasVaultBalanceNow && (
                  <span aria-hidden="true" className="ml-1 h-1.5 w-1.5 rounded-full bg-primary/90 animate-pulse-soft" />
                )}
              </div>
              <span className={`font-mono font-medium transition-colors duration-200 ${hasVaultBalanceNow ? "text-primary" : "text-foreground/60"}`}>
                {safeFormatYoctoNear(expectedImmediateYocto.toString())} NEAR
              </span>
            </li>
            {maturedTotalLabel && (
              <li className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 transition-colors duration-200 ${hasMaturedNow ? "text-primary/90" : "text-foreground/40"}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="8" r="6" />
                    <path d="M5.5 8l2 2 3.5-3.5" />
                  </svg>
                  <span className="text-secondary-text">{STRINGS.maturedClaimableNow}</span>
                  {hasMaturedNow && (
                    <span aria-hidden="true" className="ml-1 h-1.5 w-1.5 rounded-full bg-primary/90 animate-pulse-soft" />
                  )}
                </div>
                <span className={`font-mono font-medium transition-colors duration-200 ${hasMaturedNow ? "text-primary" : "text-foreground/60"}`}>
                  {maturedTotalLabel} NEAR
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}

type ProcessActionsProps = {
  hasClaimableNow: boolean;
  processPending: boolean;
  processError: string | null;
  onProcess: () => void;
};

function ProcessActions({ hasClaimableNow, processPending, processError, onProcess }: ProcessActionsProps) {
  return (
    <div className="mt-4 flex flex-col items-end gap-2">
      <Button
        type="button"
        onClick={onProcess}
        disabled={processPending || !hasClaimableNow}
        className="w-full justify-center gap-2 sm:w-auto"
        title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
        aria-busy={processPending ? true : undefined}
      >
        {processPending ? STRINGS.processing : STRINGS.processNow}
      </Button>
      {processError && (
        <div className="text-xs text-red-600" role="alert">{processError}</div>
      )}
      {processPending && (
        <div className="sr-only" role="status" aria-live="polite">{STRINGS.processing}</div>
      )}
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
  return (
    <Card className="space-y-3 rounded-xl border border-white/10 bg-background/75 px-4 py-4" role="region" aria-label="Liquidation status">
      <div className="flex items-center justify-between gap-2">
        <div className="text-base font-medium">
          {isActiveLender ? STRINGS.liquidationInProgress : STRINGS.ownerLiquidationHeader}
        </div>
        <Badge
          variant={isActiveLender ? "neutral" : "danger"}
          title={expiryDate ? formatDateTime(expiryDate) : undefined}
        >
          {STRINGS.expiredLabel}
        </Badge>
      </div>
      {!isActiveLender && (
        <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
          {ownerLiquidationSummary}
        </div>
      )}
      {isActiveLender ? (
        <div>
          <LiquidationPayoutCard
            liquidatedYocto={liquidatedYocto}
            remainingTargetLabel={remainingTargetLabel}
            collateralLabel={collateralLabel}
            claimableNowLabel={claimableNowLabel}
            hasClaimableNow={hasClaimableNow}
            expectedImmediateYocto={expectedImmediateYocto}
            maturedYocto={maturedYocto}
            maturedTotalLabel={maturedTotalLabel}
            className="py-4 space-y-3"
          />
          <ProcessActions
            hasClaimableNow={hasClaimableNow}
            processPending={processPending}
            processError={processError}
            onProcess={onProcess}
          />
          {unbondingTotalLabel && (
            <UnbondingStatusCard
              className="mt-2"
              open={showDetails}
              onToggle={onToggleDetails}
              count={unbondingEntries?.length ?? 0}
              totalLabel={unbondingTotalLabel}
              etaLabel={longestEtaLabel}
              entries={unbondingEntries ?? []}
              footnote={STRINGS.unbondingFootnoteLender}
            />
          )}
        </div>
      ) : (
        <>
          <LiquidationPayoutCard
            liquidatedYocto={liquidatedYocto}
            remainingTargetLabel={remainingTargetLabel}
            collateralLabel={collateralLabel}
            claimableNowLabel={claimableNowLabel}
            hasClaimableNow={hasClaimableNow}
            expectedImmediateYocto={expectedImmediateYocto}
            maturedYocto={maturedYocto}
            maturedTotalLabel={maturedTotalLabel}
            className="mt-2"
          />
          {isOwner && (
            <ProcessActions
              hasClaimableNow={hasClaimableNow}
              processPending={processPending}
              processError={processError}
              onProcess={onProcess}
            />
          )}
          {unbondingTotalLabel && (
            <UnbondingStatusCard
              className="mt-2"
              open={showDetails}
              onToggle={onToggleDetails}
              count={unbondingEntries?.length ?? 0}
              totalLabel={unbondingTotalLabel}
              etaLabel={longestEtaLabel}
              entries={unbondingEntries ?? []}
              footnote={STRINGS.unbondingFootnoteOwner}
            />
          )}
        </>
      )}
      {/* Removed redundant owner note; the header and expired+in-progress line already convey this */}
    </Card>
  );
}
