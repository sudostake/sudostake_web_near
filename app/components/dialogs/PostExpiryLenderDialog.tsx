"use client";

import React from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { STRINGS } from "@/utils/strings";
import { Button } from "@/app/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onBegin?: () => void;
  vaultId: string;
  tokenSymbol?: string;
  totalDueLabel?: string;
  collateralNearLabel?: string;
  pending?: boolean;
  error?: string | null;
  payoutTo?: string;
  payoutToUrl?: string;
  expectedImmediateLabel?: string | null;
  maturedTotalLabel?: string | null;
  expectedNextLabel?: string | null;
  closesRepay?: boolean;
  willBePartial?: boolean;
  inProgress?: boolean;
  canProcessNow?: boolean;
};

export function PostExpiryLenderDialog({
  open,
  onClose,
  onBegin,
  vaultId,
  tokenSymbol,
  totalDueLabel,
  collateralNearLabel,
  pending,
  error,
  payoutTo,
  payoutToUrl,
  expectedImmediateLabel,
  maturedTotalLabel,
  expectedNextLabel,
  closesRepay,
  willBePartial,
  inProgress,
  canProcessNow,
}: Props) {
  const [showMore, setShowMore] = React.useState(false);
  const title = inProgress ? STRINGS.liquidationInProgress : STRINGS.loanExpired;
  const primaryCta = inProgress ? STRINGS.continueProcessing : STRINGS.beginLiquidation;
  const intro = inProgress ? STRINGS.liquidationInProgressIntro : STRINGS.loanExpiredBodyIntro;

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose} disabled={pending}>
            {STRINGS.close}
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={onBegin}
            disabled={pending || canProcessNow === false}
            title={canProcessNow === false ? STRINGS.nothingAvailableNow : undefined}
          >
            {pending ? STRINGS.processing : primaryCta}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p>
          {intro}{" "}
          <span className="font-medium" title={vaultId}>{vaultId}</span>.
        </p>
        {inProgress && (
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden></span>
            <span>{STRINGS.liquidationInProgress}</span>
          </div>
        )}
        <div className="rounded border bg-background p-3">
          <div className="text-sm text-emerald-900">
            {STRINGS.lenderGratitude}
          </div>
        </div>
        <div className="rounded border bg-background p-3">
          <div className="text-sm font-medium mb-2">{STRINGS.whatHappensNext}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{inProgress ? STRINGS.willContinueProcess : STRINGS.willStartProcess}</li>
            <li>{STRINGS.attachesOneYocto}</li>
            <li>{inProgress ? STRINGS.mayTakeTimeContinuing : STRINGS.mayTakeTime}</li>
            <li>{inProgress ? STRINGS.trackProgressHereInProgress : STRINGS.trackProgressHere}</li>
            <li>{STRINGS.youCanCloseWindow}</li>
            {closesRepay && (<li>{STRINGS.liquidationClosesRepay}</li>)}
            {willBePartial === true && (<li>{STRINGS.willBePartial}</li>)}
            {willBePartial === false && (<li>{STRINGS.willSettleNow}</li>)}
          </ul>
        </div>
        {payoutTo && (
          <div className="rounded border bg-background p-3">
            <div className="text-sm font-medium mb-1">{STRINGS.payoutDestination}</div>
            <div className="text-sm">
              {STRINGS.payoutsGoTo} <span className="font-medium break-all" title={payoutTo}>{payoutTo}</span>
              {payoutToUrl && (
                <a href={payoutToUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-primary">
                  {STRINGS.viewAccountOnExplorer}
                </a>
              )}
            </div>
          </div>
        )}
        {(expectedImmediateLabel || maturedTotalLabel || expectedNextLabel) && (
          <div className="rounded border bg-background p-3">
            <div className="text-sm font-medium mb-2">{STRINGS.nextPayoutSources}</div>
            <div className="text-sm space-y-2">
              {expectedNextLabel && (
                <div className="flex items-center justify-between">
                  <div className="text-secondary-text">{STRINGS.expectedNext}</div>
                  <div className="font-medium">{expectedNextLabel} NEAR</div>
                </div>
              )}
              <button
                type="button"
                className="text-xs underline text-primary"
                onClick={() => setShowMore((v) => !v)}
              >
                {showMore ? STRINGS.hideDetails : STRINGS.showDetails}
              </button>
              {showMore && (
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-secondary-text">{STRINGS.sourceVaultBalanceNow}</div>
                    <div className="font-medium">{expectedImmediateLabel ?? "0"} NEAR</div>
                  </div>
                  <div>
                    <div className="text-secondary-text">{STRINGS.sourceMaturedUnbonding}</div>
                    <div className="font-medium">{maturedTotalLabel ?? STRINGS.noMaturedYet} {maturedTotalLabel ? "NEAR" : ""}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="rounded border bg-background p-3">
          <div className="text-sm font-medium mb-2">{STRINGS.safetyTitle}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{STRINGS.safetyYourKeys}</li>
            <li>{STRINGS.safetyContractChecks}</li>
            <li>{STRINGS.safetyNoExtraFunds}</li>
            <li>{STRINGS.safetyCollateralBacked}</li>
            <li>{STRINGS.safetyRetry}</li>
            <li>{STRINGS.safetyOnChain}</li>
          </ul>
        </div>
        {(totalDueLabel || collateralNearLabel) && (
          <div className="rounded border bg-background p-3">
            <div className="grid grid-cols-2 gap-2">
              {totalDueLabel && (
                <>
                  <div className="text-secondary-text">{STRINGS.totalDue}</div>
                  <div className="font-medium">{totalDueLabel}{tokenSymbol ? ` ${tokenSymbol}` : ""}</div>
                </>
              )}
              {collateralNearLabel && (
                <>
                  <div className="text-secondary-text">{STRINGS.vaultCollateral}</div>
                  <div className="font-medium">{collateralNearLabel} NEAR</div>
                </>
              )}
            </div>
          </div>
        )}
        <div className="rounded border bg-background p-3">
          <div className="text-sm font-medium mb-2">{STRINGS.requirements}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{STRINGS.reqLenderOnly}</li>
            <li>{STRINGS.reqExpired}</li>
          </ul>
        </div>
        <p className="text-secondary-text">{STRINGS.liquidationGuideNote}</p>
        {error && <div className="text-xs text-red-600" role="alert">{error}</div>}
      </div>
    </Modal>
  );
}
