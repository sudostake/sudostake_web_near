"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useClaimUnstaked } from "@/hooks/useClaimUnstaked";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { NATIVE_TOKEN } from "@/utils/constants";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { Button } from "@/app/components/ui/Button";

/**
 * Dialog for withdrawing matured unstaked NEAR from a validator back into the vault.
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
      console.warn("Withdraw unstaked failed", e);
      const msg = error ?? "Withdraw unstaked failed. Please try again.";
      setLocalError(msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={`Withdraw unstaked ${NATIVE_TOKEN} to vault`}
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={pending}>
            {pending ? "Withdrawing..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-secondary-text">
          This moves matured unstaked {NATIVE_TOKEN} from the validator back into your vault&apos;s available balance.
        </p>
        <div className="text-sm text-secondary-text">
          Validator: <span className="font-mono text-foreground" title={validator}>{validator}</span>
        </div>
        <div className="text-sm">
          <span className="text-secondary-text mr-1">Amount returning to vault:</span>
          <span className="font-mono font-medium">
            {loading ? "…" : claimDisplay ?? `0 ${NATIVE_TOKEN}`}
          </span>
        </div>
        <div className="text-sm text-secondary-text">
          Vault destination: <span className="font-mono text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        {(localError || error) && (
          <div className="text-xs text-red-500">{localError ?? error}</div>
        )}
      </div>
    </Modal>
  );
}
