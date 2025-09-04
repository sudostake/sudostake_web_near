"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useClaimUnstaked } from "@/hooks/useClaimUnstaked";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { NATIVE_TOKEN } from "@/utils/constants";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";

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
  const { data, loading } = useVaultDelegations(factoryId, vaultId);

  const claimEntry = useMemo(() => data?.summary?.find((e) => e.validator === validator), [data, validator]);
  const claimDisplay = claimEntry?.unstaked_balance.toDisplay();

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
      title={`Claim unstaked ${NATIVE_TOKEN}`}
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
          Validator: <span className="font-mono text-foreground" title={validator}>{validator}</span>
        </div>
        <div className="text-sm">
          <span className="text-secondary-text mr-1">Amount to claim:</span>
          <span className="font-mono font-medium">
            {loading ? "…" : claimDisplay ?? `0 ${NATIVE_TOKEN}`}
          </span>
        </div>
        {(localError || error) && (
          <div className="text-xs text-red-500">{localError ?? error}</div>
        )}
      </div>
    </Modal>
  );
}
