"use client";

import React from "react";
import type { ViewerRole } from "@/hooks/useViewerRole";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import { utils } from "near-api-js";
import { formatMinimalTokenAmount } from "@/utils/format";
import { sumMinimal } from "@/utils/amounts";
import { RequestLiquidityDialog } from "@/app/components/dialogs/RequestLiquidityDialog";
import { AcceptLiquidityConfirm } from "@/app/components/dialogs/AcceptLiquidityConfirm";
import { PostExpiryLenderDialog } from "@/app/components/dialogs/PostExpiryLenderDialog";
import { PostExpiryOwnerDialog } from "@/app/components/dialogs/PostExpiryOwnerDialog";
import { RepayLoanDialog } from "@/app/components/dialogs/RepayLoanDialog";
import type { LiquidityRequestContentData } from "./LiquidityRequestContent";

type LiquidityRequest = {
  token: string;
  amount: string;
  interest: string;
  collateral: string;
  duration: number;
};

type Props = {
  isOwner: boolean;
  role: ViewerRole;
  state?: "idle" | "pending" | "active";
  vaultId: string;
  factoryId: string;
  network: Network;
  content: LiquidityRequestContentData | null;
  liquidityRequest: LiquidityRequest | null | undefined;
  openDialog: boolean;
  onCloseOpenDialog: () => void;
  acceptOpen: boolean;
  onCloseAccept: () => void;
  onConfirmAccept: () => void;
  acceptPending: boolean;
  acceptError?: string | null;
  tokenSymbol: string;
  tokenDecimals: number;
  postExpiryOpen: boolean;
  onClosePostExpiry: () => void;
  onBeginLiquidation: () => void;
  processPending: boolean;
  processError?: string | null;
  lenderId?: string | null;
  expectedImmediateLabel?: string | null;
  maturedTotalLabel?: string | null;
  expectedNextLabel?: string | null;
  closesRepay: boolean;
  willBePartial: boolean;
  canProcessNow: boolean;
  inProgress: boolean;
  showLenderGratitude: boolean;
  ownerPostExpiryOpen: boolean;
  onCloseOwnerPostExpiry: () => void;
  onOwnerRepay: () => void;
  repayOpen: boolean;
  onCloseRepay: () => void;
  onRepaySuccess: () => void;
  onVaultTokenBalanceChange: () => void;
};

export function LiquidityRequestDialogs({
  isOwner,
  role,
  state,
  vaultId,
  factoryId,
  network,
  content,
  liquidityRequest,
  openDialog,
  onCloseOpenDialog,
  acceptOpen,
  onCloseAccept,
  onConfirmAccept,
  acceptPending,
  acceptError,
  tokenSymbol,
  tokenDecimals,
  postExpiryOpen,
  onClosePostExpiry,
  onBeginLiquidation,
  processPending,
  processError,
  lenderId,
  expectedImmediateLabel,
  maturedTotalLabel,
  expectedNextLabel,
  closesRepay,
  willBePartial,
  canProcessNow,
  inProgress,
  showLenderGratitude,
  ownerPostExpiryOpen,
  onCloseOwnerPostExpiry,
  onOwnerRepay,
  repayOpen,
  onCloseRepay,
  onRepaySuccess,
  onVaultTokenBalanceChange,
}: Props) {
  const hasRequestData = Boolean(content && liquidityRequest);
  const totalDueLabel = liquidityRequest
    ? formatMinimalTokenAmount(sumMinimal(liquidityRequest.amount, liquidityRequest.interest), tokenDecimals)
    : undefined;
  const collateralNearLabel = liquidityRequest
    ? utils.format.formatNearAmount(liquidityRequest.collateral)
    : undefined;
  const payoutToUrl = lenderId ? explorerAccountUrl(network, lenderId) : undefined;

  return (
    <>
      {isOwner && (
        <RequestLiquidityDialog
          open={openDialog}
          onClose={onCloseOpenDialog}
          vaultId={vaultId}
        />
      )}

      {/* Lender confirmation dialog */}
      {acceptOpen && hasRequestData && liquidityRequest && (
        <AcceptLiquidityConfirm
          open={acceptOpen}
          onClose={onCloseAccept}
          onConfirm={onConfirmAccept}
          pending={acceptPending}
          error={acceptError ?? undefined}
          vaultId={vaultId}
          tokenSymbol={tokenSymbol}
          decimals={tokenDecimals}
          amountRaw={liquidityRequest.amount}
          interestRaw={liquidityRequest.interest}
          collateralYocto={liquidityRequest.collateral}
          durationSeconds={liquidityRequest.duration}
        />
      )}

      {/* Post-expiry lender popup */}
      {postExpiryOpen && (role === "activeLender" || isOwner) && state === "active" && hasRequestData && liquidityRequest && (
        <PostExpiryLenderDialog
          open={postExpiryOpen}
          onClose={onClosePostExpiry}
          onBegin={onBeginLiquidation}
          vaultId={vaultId}
          tokenSymbol={tokenSymbol}
          totalDueLabel={totalDueLabel}
          collateralNearLabel={collateralNearLabel}
          pending={processPending}
          error={processError ?? undefined}
          payoutTo={lenderId ?? undefined}
          payoutToUrl={payoutToUrl}
          expectedImmediateLabel={expectedImmediateLabel ?? undefined}
          maturedTotalLabel={maturedTotalLabel ?? undefined}
          expectedNextLabel={expectedNextLabel ?? undefined}
          closesRepay={closesRepay}
          willBePartial={willBePartial}
          canProcessNow={canProcessNow}
          inProgress={inProgress}
          showLenderGratitude={showLenderGratitude}
        />
      )}

      {/* Post-expiry owner popup */}
      {ownerPostExpiryOpen && isOwner && state === "active" && hasRequestData && liquidityRequest && (
        <PostExpiryOwnerDialog
          open={ownerPostExpiryOpen}
          onClose={onCloseOwnerPostExpiry}
          onRepay={onOwnerRepay}
          vaultId={vaultId}
          tokenSymbol={tokenSymbol}
          totalDueLabel={totalDueLabel}
          collateralNearLabel={collateralNearLabel}
        />
      )}

      {/* Repay dialog for owner */}
      {repayOpen && isOwner && liquidityRequest && (
        <RepayLoanDialog
          open={repayOpen}
          onClose={onCloseRepay}
          vaultId={vaultId}
          factoryId={factoryId}
          tokenId={liquidityRequest.token}
          principalMinimal={liquidityRequest.amount}
          interestMinimal={liquidityRequest.interest}
          onSuccess={onRepaySuccess}
          onVaultTokenBalanceChange={onVaultTokenBalanceChange}
        />
      )}
    </>
  );
}
