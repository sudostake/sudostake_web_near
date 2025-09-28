"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useDeposit } from "@/hooks/useDeposit";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

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
  symbol: string;
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const { balances, loading: balancesLoading } = useTokenBalances();
  const { deposit, pending: depositing, error: depositError } = useDeposit();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  const balanceObj = (symbol?.toUpperCase() === "USDC" ? balances.usdc : balances.near);
  const availableNumber = parseNumber(balanceObj.toDisplay());
  const amountNumber = parseNumber(amount);
  const disableContinue = amountNumber <= 0 || amountNumber > availableNumber;

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
          <Button variant="secondary" onClick={resetAndClose} disabled={depositing}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || depositing}>
            {depositing ? "Depositing..." : "Continue"}
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
        {depositError && (
          <div className="text-xs text-red-500">{depositError}</div>
        )}
        <MaxAvailable
          loading={balancesLoading}
          label="Max you can deposit"
          balance={balanceObj}
          buttonAriaLabel="Use maximum available"
          onClick={() => setAmount(balanceObj.toDisplay())}
        />
      </div>
    </Modal>
  );
}
