"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useUndelegate } from "@/hooks/useUndelegate";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import Big from "big.js";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Balance } from "@/utils/balance";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

/**
 * Dialog for undelegating NEAR tokens from a vault contract for a specific validator.
 */
export function UndelegateDialog({
  open,
  onClose,
  vaultId,
  validator,
  balance,
  loading,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  validator: string;
  /** Balance abstraction with raw and display values. */
  balance: Balance;
  /** True while balance is loading. */
  loading?: boolean;
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const { undelegate, pending, error } = useUndelegate();
  const [localError, setLocalError] = useState<string | null>(null);
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  // Use Balance display for max and comparisons
  const disableContinue = useMemo(() => {
    try {
      const a = new Big(amount || "0");
      const m = new Big(balance.toDisplay());
      return a.lte(0) || a.gt(m);
    } catch {
      return true;
    }
  }, [amount, balance]);

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    setLocalError(null);
    try {
      const { txHash } = await undelegate({ vault: vaultId, validator, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
      resetAndClose();
    } catch (e: unknown) {
      console.warn("Undelegate failed", e);
      const msg = e instanceof Error ? e.message : "Undelegate failed. Please try again.";
      setLocalError(msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={`Undelegate from ${validator}`}
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || pending}>
            {pending ? "Undelegating..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label={`Amount (${balance.symbol})`}
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {(localError || error) && (
          <div className="text-xs text-red-500">{localError ?? error}</div>
        )}
        <MaxAvailable
          loading={loading}
          balance={balance}
          onClick={() => setAmount(balance.toDisplay())}
        />
      </div>
    </Modal>
  );
}
