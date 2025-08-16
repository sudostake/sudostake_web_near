"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useDeposit } from "@/hooks/useDeposit";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { MaxAvailable } from "@/app/components/dialogs/MaxAvailable";

export function DepositDialog({
  open,
  onClose,
  vaultId,
  symbol,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  symbol?: string;
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const { balances, loading: balancesLoading } = useTokenBalances();
  const { deposit, pending: depositing, error: depositError } = useDeposit();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  const modalSymbol = (symbol ?? "NEAR").toUpperCase();
  const availableStr = modalSymbol === "USDC" ? balances.usdc : balances.near;

  const amountNum = Number(amount);
  const depositAvailableNum = parseNumber(availableStr);
  const disableContinue =
    !amount ||
    Number.isNaN(amountNum) ||
    amountNum <= 0 ||
    Number.isNaN(depositAvailableNum) ||
    amountNum > depositAvailableNum;

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    try {
      const { txHash } = await deposit({ vault: vaultId, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn("Deposit failed", err);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Deposit to vault"
      disableBackdropClose={depositing}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
            onClick={resetAndClose}
            disabled={depositing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={disableContinue || depositing}
            onClick={confirm}
          >
            {depositing ? "Depositing..." : "Continue"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <label className="block text-sm">
          <span className="text-secondary-text">Amount</span>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0.0"
            className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        {depositError && (
          <div className="text-xs text-red-500">{depositError}</div>
        )}
        <MaxAvailable
          loading={balancesLoading}
          label="Max you can deposit"
          balance={availableStr}
          suffix={modalSymbol}
          buttonAriaLabel="Use maximum available"
          onClick={() => {
            const numeric = parseNumber(availableStr);
            setAmount(Number.isNaN(numeric) ? "" : numeric.toString());
          }}
        />
      </div>
    </Modal>
  );
}
