"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useUndelegate } from "@/hooks/useUndelegate";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";

/**
 * Dialog for undelegating NEAR tokens from a vault contract for a specific validator.
 */
export function UndelegateDialog({
  open,
  onClose,
  vaultId,
  validator,
  stakedBalance,
  stakedLoading,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  validator: string;
  /** Staked balance available to undelegate (human-friendly NEAR string). */
  stakedBalance?: string | null;
  /** True while staked balance is loading. */
  stakedLoading?: boolean;
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const { undelegate, pending, error } = useUndelegate();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  const max = parseNumber(stakedBalance);
  const maxAvailable = Number.isNaN(max) ? 0 : max;
  const amountNum = Number(amount);
  const disableContinue =
    !validator ||
    !amount ||
    Number.isNaN(amountNum) ||
    amountNum <= 0 ||
    amountNum > maxAvailable;

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    try {
      const { txHash } = await undelegate({ vault: vaultId, validator, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
    } catch (e) {
      console.warn("Undelegate failed", e);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Undelegate from validator"
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
            onClick={resetAndClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={disableContinue || pending}
            onClick={confirm}
          >
            {pending ? "Undelegating..." : "Continue"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <div className="text-sm text-secondary-text">
          Validator: <span className="font-mono text-foreground" title={validator}>{validator}</span>
        </div>
        <label className="block text-sm">
          <span className="text-secondary-text">Amount (NEAR)</span>
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
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex items-center justify-between text-xs text-secondary-text">
          <div>Max available: {stakedLoading ? "…" : stakedBalance} NEAR</div>
          <button
            type="button"
            className="underline disabled:no-underline disabled:opacity-60"
            disabled={stakedLoading}
            onClick={() => { if (maxAvailable > 0) setAmount(maxAvailable.toString()); }}
          >
            Max
          </button>
        </div>
      </div>
    </Modal>
  );
}
