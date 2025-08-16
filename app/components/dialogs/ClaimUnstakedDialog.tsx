"use client";

import React, { useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useClaimUnstaked } from "@/hooks/useClaimUnstaked";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";

/**
 * Dialog for claiming unstaked NEAR tokens from a vault contract for a validator.
 */
export function ClaimUnstakedDialog({
  open,
  onClose,
  vaultId,
  validator,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  validator: string;
  onSuccess?: () => void;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const { claimUnstaked, pending, error } = useClaimUnstaked();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  const resetAndClose = () => {
    setLocalError(null);
    onClose();
  };

  const confirm = async () => {
    setLocalError(null);
    try {
      const { txHash } = await claimUnstaked({ vault: vaultId, validator });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
      resetAndClose();
    } catch (e: unknown) {
      console.warn("Claim unstaked failed", e);
      const msg = error ?? "Claim unstaked failed. Please try again.";
      setLocalError(msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Claim unstaked NEAR"
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
            disabled={pending}
            onClick={confirm}
          >
            {pending ? "Claiming..." : "Continue"}
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
        {(localError || error) && (
          <div className="text-xs text-red-500">{localError ?? error}</div>
        )}
      </div>
    </Modal>
  );
}
