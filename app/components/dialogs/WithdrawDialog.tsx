"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { useWithdraw } from "@/hooks/useWithdraw";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

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
          <Button variant="secondary" onClick={resetAndClose} disabled={withdrawing}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || withdrawing}>
            {withdrawing ? "Withdrawing..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <Input
          label="Amount"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
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
