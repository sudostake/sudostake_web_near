"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { MaxAvailable } from "@/app/components/MaxAvailable";

export function WithdrawDialog({
  open,
  onClose,
  vaultId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const { balance: availBalance, loading: availLoading } = useAvailableBalance(vaultId);
  const { withdraw, pending: withdrawing, error: withdrawError } = useWithdraw();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  const amountNum = Number(amount);
  const withdrawAvailableNum = parseNumber(availBalance.toDisplay());
  const disableContinue =
    !amount ||
    Number.isNaN(amountNum) ||
    amountNum <= 0 ||
    Number.isNaN(withdrawAvailableNum) ||
    amountNum > withdrawAvailableNum;

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    try {
      // Submit human-friendly display amount and let hook parse it
      const { txHash } = await withdraw({ vault: vaultId, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      if (onSuccess) onSuccess();

    } catch (err) {
      console.warn("Withdraw failed", err);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Withdraw from vault"
      disableBackdropClose={withdrawing}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
            onClick={resetAndClose}
            disabled={withdrawing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={disableContinue || withdrawing}
            onClick={confirm}
          >
            {withdrawing ? "Withdrawing..." : "Continue"}
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
        {withdrawError && (
          <div className="text-xs text-red-500">{withdrawError}</div>
        )}
        <MaxAvailable
          loading={availLoading}
          label="Max you can withdraw"
          balance={availBalance}
          buttonAriaLabel="Use maximum available"
          onClick={() => setAmount(availBalance.toDisplay())}
        />
      </div>
    </Modal>
  );
}
