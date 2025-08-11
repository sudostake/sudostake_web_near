"use client";

import React from "react";
import { Modal } from "./Modal";
import { utils } from "near-api-js";
import { VAULT_CREATION_FEE } from "@/utils/constants";
import { getActiveFactoryId } from "@/utils/networks";
import { useCreateVault } from "@/hooks/useCreateVault";
import { useIndexVault } from "@/hooks/useIndexVault";

export function CreateVaultModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { pending, createVault } = useCreateVault();
  const { indexVault, pending: indexing } = useIndexVault();
  const feeNear = utils.format.formatNearAmount(VAULT_CREATION_FEE);
  const factoryId = getActiveFactoryId();

  const confirm = async () => {
    try {
      const { vaultId, txHash } = await createVault({ factoryId });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onClose();
    } catch (err) {
      console.warn("Create or index vault failed", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Vault" disableBackdropClose={pending || indexing}>
      <div className="space-y-4">
        <p>Minting a new vault requires a one-time network fee.</p>
        <p className="text-sm text-secondary-text">
          Total cost: <span className="font-medium text-foreground">{feeNear} NEAR</span>
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border bg-surface hover:bg-surface/90"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending || indexing}
            className="px-4 py-2 rounded bg-primary text-primary-text hover:opacity-90 disabled:opacity-50"
          >
            {pending || indexing ? "Creating..." : "Create Vault"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
