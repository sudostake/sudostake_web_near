"use client";

import React from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { formatMinimalTokenAmount } from "@/utils/format";
import { formatDurationFromSeconds } from "@/utils/time";
import { Button } from "@/app/components/ui/Button";
import Big from "big.js";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { SECONDS_PER_YEAR } from "@/utils/constants";

export type AcceptLiquidityConfirmProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
  vaultId: string;
  tokenId: string;
  tokenSymbol: string;
  decimals: number;
  amountRaw: string; // minimal
  interestRaw: string; // minimal
  collateralYocto: string; // yoctoNEAR
  durationSeconds: number;
};

export function AcceptLiquidityConfirm({
  open,
  onClose,
  onConfirm,
  pending = false,
  error,
  vaultId,
  tokenId,
  tokenSymbol,
  decimals,
  amountRaw,
  interestRaw,
  collateralYocto,
  durationSeconds,
}: AcceptLiquidityConfirmProps) {
  const lendAmount = formatMinimalTokenAmount(amountRaw, decimals);
  const interestAmount = formatMinimalTokenAmount(interestRaw, decimals);
  let totalRepay = "-";
  try {
    const sum = (BigInt(amountRaw) + BigInt(interestRaw)).toString();
    totalRepay = formatMinimalTokenAmount(sum, decimals);
  } catch {}

  // Estimated APR (annualized simple interest). This is an approximation.
  let estApr = "—";
  try {
    const amount = new Big(amountRaw);
    const interest = new Big(interestRaw);
    if (amount.gt(0) && durationSeconds > 0) {
      const apr = interest.div(amount).times(SECONDS_PER_YEAR).div(durationSeconds).times(100);
      estApr = `${apr.round(2, 0 /* RoundDown */).toString()}%`;
    }
  } catch {}

  const collateralNear = safeFormatYoctoNear(collateralYocto, 5);
  
  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Confirm Lending"
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Confirming…" : "Confirm accept"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <div>
          You are lending <span className="font-medium">{lendAmount} {tokenSymbol}</span>
          {" "}to <span className="font-medium" title={vaultId}>{vaultId}</span>.
        </div>
        <div className="rounded border bg-background p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-secondary-text">You’ll receive on-time</div>
            <div className="font-medium">{totalRepay} {tokenSymbol}</div>
            <div className="text-secondary-text">Includes interest</div>
            <div className="font-medium">{interestAmount} {tokenSymbol}</div>
            <div className="text-secondary-text">Repayment window</div>
            <div className="font-medium">{formatDurationFromSeconds(durationSeconds)}</div>
            <div className="text-secondary-text">Estimated rate</div>
            <div className="font-medium">{estApr}</div>
          </div>
        </div>
        <div className="rounded border bg-background p-3">
          <div className="font-medium">If repayment is late</div>
          <div className="mt-1 text-secondary-text">
            Your claim is paid from the vault’s NEAR collateral
            ({collateralNear} NEAR) according to the contract rules.
          </div>
        </div>
        <div className="text-xs text-secondary-text">
          You’ll approve this in your wallet. It moves the tokens from your account to the vault.
          A tiny network fee applies and a minimal deposit is attached (1 yoctoNEAR) as required by the network.
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}
