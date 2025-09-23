"use client";

import React from "react";
import { Button } from "@/app/components/ui/Button";
import { STRINGS } from "@/utils/strings";
import { formatMinimalTokenAmount } from "@/utils/format";

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
  const disabled =
    pending ||
    balLoading ||
    !sufficientBalance ||
    lenderRegistered === false ||
    vaultRegisteredForToken === false;

  const title = (() => {
    if (pending || balLoading) return undefined;
    if (!sufficientBalance && amountRaw) {
      const need = formatMinimalTokenAmount(amountRaw, tokenDecimals);
      return `Need ${need} ${tokenSymbol}, have ${lenderBalanceLabel} ${tokenSymbol}`;
    }
    if (lenderRegistered === false) return STRINGS.mustRegisterAccountBeforeAccept;
    if (vaultRegisteredForToken === false) return STRINGS.vaultMustBeRegisteredBeforeLending;
    return undefined;
  })();

  const label = (() => {
    if (pending) return STRINGS.accepting;
    if (balLoading) return STRINGS.checkingBalance;
    if (lenderRegistered === false) return STRINGS.registrationRequired;
    if (vaultRegisteredForToken === false) return STRINGS.vaultNotRegisteredShort;
    if (sufficientBalance) return STRINGS.acceptRequest;
    return STRINGS.insufficientBalance;
  })();

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
