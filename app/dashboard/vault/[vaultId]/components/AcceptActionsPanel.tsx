"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS } from "@/utils/strings";
import { computeAcceptDisabled, computeAcceptLabel, computeAcceptTitle } from "./acceptActionsLogic";

type Props = {
  pending: boolean;
  balLoading: boolean;
  sufficientBalance: boolean;
  lenderRegistered: boolean | null;
  vaultRegisteredForToken: boolean | null;
  amountRaw?: string | null;
  tokenDecimals: number;
  tokenSymbol: string;
  lenderBalanceLabel: string;
  acceptError?: string | null;
  onOpen: () => void;
};

export function AcceptActionsPanel({
  pending,
  balLoading,
  sufficientBalance,
  lenderRegistered,
  vaultRegisteredForToken,
  amountRaw,
  tokenDecimals,
  tokenSymbol,
  lenderBalanceLabel,
  acceptError,
  onOpen,
}: Props) {
  const disabled = computeAcceptDisabled(pending, balLoading, sufficientBalance, lenderRegistered, vaultRegisteredForToken);
  const title = computeAcceptTitle(
    pending,
    balLoading,
    sufficientBalance,
    amountRaw ?? null,
    tokenDecimals,
    tokenSymbol,
    lenderBalanceLabel,
    lenderRegistered,
    vaultRegisteredForToken
  );
  const label = computeAcceptLabel(pending, balLoading, lenderRegistered, vaultRegisteredForToken, sufficientBalance);

  return (
    <div>
      {acceptError && (
        <div className="text-sm text-red-500" role="alert">{acceptError}</div>
      )}
      <Button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        variant="primary"
        size="md"
        className="gap-2"
        title={title}
      >
        {label}
      </Button>
    </div>
  );
}
