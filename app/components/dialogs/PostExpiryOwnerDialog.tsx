"use client";

import React from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { STRINGS } from "@/utils/strings";
import { Button } from "@/app/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onRepay?: () => void;
  vaultId: string;
  tokenSymbol?: string;
  totalDueLabel?: string;
  collateralNearLabel?: string;
  pending?: boolean;
  error?: string | null;
};

export function PostExpiryOwnerDialog({
  open,
  onClose,
  onRepay,
  vaultId,
  tokenSymbol,
  totalDueLabel,
  collateralNearLabel,
  pending,
  error,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={STRINGS.loanExpired}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose} disabled={pending}>
            {STRINGS.close}
          </Button>
          <Button className="w-full sm:w-auto" onClick={onRepay} disabled={pending}>
            {STRINGS.ownerRepayNow}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p>
          {STRINGS.ownerLoanExpiredIntro}{" "}
          <span className="font-medium" title={vaultId}>{vaultId}</span>.
        </p>
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
          <div className="text-sm font-medium mb-2">{STRINGS.ownerWhatYouCanDo}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{STRINGS.ownerCanRepay}</li>
            <li>{STRINGS.ownerLiquidationMayStart}</li>
            <li>{STRINGS.ownerCollateralRisk}</li>
          </ul>
        </div>
        <div className="rounded border bg-background p-3">
          <div className="text-sm font-medium mb-2">{STRINGS.safetyTitle}</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{STRINGS.safetyYourKeys}</li>
            <li>{STRINGS.safetyContractChecks}</li>
            <li>{STRINGS.safetyNoExtraFunds}</li>
            <li>{STRINGS.safetyOnChain}</li>
          </ul>
        </div>
        {error && <div className="text-xs text-red-600" role="alert">{error}</div>}
      </div>
    </Modal>
  );
}
