"use client";

import React from "react";
import { Modal } from "./Modal";
import { utils } from "near-api-js";
import { VAULT_CREATION_FEE, MINT_VAULT_METHOD, DEFAULT_GAS } from "@/utils/constants";

export function CreateVaultModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const feeNear = utils.format.formatNearAmount(VAULT_CREATION_FEE);

  const confirm = () => {
    console.log("mintVault placeholder", {
      feeYocto: VAULT_CREATION_FEE,
      feeNear,
      method: MINT_VAULT_METHOD,
      gas: DEFAULT_GAS,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Vault">
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
            className="px-4 py-2 rounded bg-primary text-primary-text hover:opacity-90"
          >
            Create Vault
          </button>
        </div>
      </div>
    </Modal>
  );
}
