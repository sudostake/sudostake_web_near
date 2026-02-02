"use client";

import React from "react";
import type { Network } from "@/utils/networks";
import { explorerAccountUrl } from "@/utils/networks";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { STRINGS } from "@/utils/strings";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { CurrentRequestPanel } from "./CurrentRequestPanel";
import { LenderActionsPanel } from "./LenderActionsPanel";
import { OwnerActionsPanel } from "./OwnerActionsPanel";
import { PotentialLenderRegistrationCard } from "./PotentialLenderRegistrationCard";
import { AcceptActionsPanel } from "./AcceptActionsPanel";

export type LiquidityRequestContentData = {
  amount: string;
  interest: string;
  collateral: string;
  durationDays: number;
  token: string;
  amountRaw: string;
  interestRaw: string;
  totalDue: string;
};

type Props = {
  content: LiquidityRequestContentData;
  state?: "idle" | "pending" | "active";
  role: ViewerRole;
  isOwner: boolean;
  liquidationActive: boolean;
  expiryDate: Date | null;
  remainingMs: number | null;
  formattedCountdown: string | null;
  expiryLabel: string | null;
  hasClaimableNow: boolean;
  claimableNowLabel: string;
  expectedNextLabel: string | null;
  lenderId?: string | null;
  network: Network;
  processError?: string | null;
  processPending: boolean;
  maturedYocto: bigint;
  onOpenProcess: () => void;
  onRepay: () => void;
  onCancel: () => void;
  cancelPending: boolean;
  cancelError?: string | null;
  tokenSymbol: string;
  lenderBalanceLabel: string;
  lenderRegistered: boolean | null;
  lenderMinDepositLabel: string | null;
  storagePending: boolean;
  storageError: string | null;
  onRegisterLender: () => void;
  vaultRegisteredForToken: boolean | null;
  pending: boolean;
  balLoading: boolean;
  sufficientBalance: boolean;
  tokenDecimals: number;
  acceptError: string | null;
  onOpenAccept: () => void;
  vaultId: string;
};

export function LiquidityRequestContent({
  content,
  state,
  role,
  isOwner,
  liquidationActive,
  expiryDate,
  remainingMs,
  formattedCountdown,
  expiryLabel,
  hasClaimableNow,
  claimableNowLabel,
  expectedNextLabel,
  lenderId,
  network,
  processError,
  processPending,
  maturedYocto,
  onOpenProcess,
  onRepay,
  onCancel,
  cancelPending,
  cancelError,
  tokenSymbol,
  lenderBalanceLabel,
  lenderRegistered,
  lenderMinDepositLabel,
  storagePending,
  storageError,
  onRegisterLender,
  vaultRegisteredForToken,
  pending,
  balLoading,
  sufficientBalance,
  tokenDecimals,
  acceptError,
  onOpenAccept,
  vaultId,
}: Props) {
  const isActive = state === "active";
  const isPending = state === "pending";
  const isExpired = isActive && remainingMs === 0;
  const showTimeline = Boolean(expiryDate && isActive);
  const showLenderActions = isActive && role === "activeLender" && expiryDate && !liquidationActive;
  const showOwnerActions = isActive && isOwner && !liquidationActive;
  const showExpiryWarning = isExpired && !liquidationActive && !isOwner;

  return (
    <>
      <CurrentRequestPanel
        content={content}
        active={isActive}
        showTimeline={showTimeline}
        countdownLabel={formattedCountdown}
        expiryLabel={expiryLabel}
        expired={Boolean(isExpired)}
      />
      {showLenderActions && (
        <LenderActionsPanel
          remainingMs={remainingMs}
          formattedCountdown={formattedCountdown}
          hasClaimableNow={hasClaimableNow}
          claimableNowLabel={claimableNowLabel}
          expectedNextLabel={expectedNextLabel}
          lenderId={lenderId}
          network={network}
          processError={processError}
          processPending={processPending}
          maturedYocto={maturedYocto}
          onOpenProcess={onOpenProcess}
        />
      )}
      {/* Intentionally allow repayment post-term:
          We keep the Repay button visible for the owner even after the
          countdown reaches zero (remainingMs === 0), up until liquidation
          actually starts. This matches the banner below which states that
          repayment is still possible until liquidation is triggered. */}
      {showOwnerActions && (
        <OwnerActionsPanel
          onRepay={onRepay}
          remainingMs={remainingMs}
          formattedCountdown={formattedCountdown}
          expiryLabel={expiryLabel}
        />
      )}
      {/* Accepted timestamp removed for a leaner UI */}
      {showExpiryWarning && (
        <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-800" role="status">
          {STRINGS.expiredRepayWarning}
        </div>
      )}
      {/* Lender appreciation card intentionally removed for a leaner UI */}
      {isOwner && isPending ? (
        <div className="flex flex-col items-end gap-2">
          <Button
            type="button"
            onClick={onCancel}
            disabled={cancelPending}
            variant="secondary"
            className="w-full justify-center gap-2 sm:w-auto"
            aria-busy={cancelPending ? true : undefined}
          >
            {cancelPending ? "Cancelling…" : STRINGS.cancelRequest}
          </Button>
          {cancelError && <div className="text-xs text-red-600" role="alert">{cancelError}</div>}
          {cancelPending && (
            <div className="sr-only" role="status" aria-live="polite">Cancelling…</div>
          )}
        </div>
      ) : isPending && role === "potentialLender" ? (
        <Card className="space-y-3 rounded-xl border border-white/10 bg-background/75 px-4 py-4" role="region" aria-label="Lender registration">
          <div className="text-sm text-secondary-text text-left">
            {STRINGS.yourBalance}: <span className="font-mono">{lenderBalanceLabel} {tokenSymbol}</span>
          </div>
          <PotentialLenderRegistrationCard
            network={network}
            tokenId={content?.token}
            lenderRegistered={lenderRegistered}
            lenderMinDeposit={lenderMinDepositLabel}
            storagePending={storagePending}
            storageError={storageError}
            onRegister={onRegisterLender}
          />
          {vaultRegisteredForToken === false && (
            <Card className="text-left text-sm rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-red-800">
              {STRINGS.vaultNotRegisteredLendingDisabled}
              <div className="mt-2 space-x-3">
                <a
                  href={explorerAccountUrl(network, vaultId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary underline"
                  aria-label={`View vault ${vaultId} on explorer`}
                >
                  {STRINGS.viewVaultOnExplorer}
                </a>
                {content?.token && (
                  <a
                    href={explorerAccountUrl(network, content.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary underline"
                    aria-label={`View token ${content.token} on explorer`}
                  >
                    {STRINGS.viewTokenOnExplorer}
                  </a>
                )}
              </div>
            </Card>
          )}
          <AcceptActionsPanel
            pending={pending}
            balLoading={balLoading}
            sufficientBalance={sufficientBalance}
            lenderRegistered={lenderRegistered}
            vaultRegisteredForToken={vaultRegisteredForToken}
            amountRaw={content?.amountRaw}
            tokenDecimals={tokenDecimals}
            tokenSymbol={tokenSymbol}
            lenderBalanceLabel={lenderBalanceLabel}
            acceptError={acceptError}
            onOpen={onOpenAccept}
          />
        </Card>
      ) : null}
      {/* Single repay action is shown above in the owner section; avoid duplicating here */}
    </>
  );
}
