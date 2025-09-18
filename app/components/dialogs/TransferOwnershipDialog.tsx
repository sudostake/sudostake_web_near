"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useTransferOwnership } from "@/hooks/useTransferOwnership";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { isValidAccountId } from "@/utils/validation/account";

export function TransferOwnershipDialog({
  open,
  onClose,
  vaultId,
  currentOwner,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  currentOwner?: string | null;
  onSuccess?: () => void;
}) {
  const [newOwner, setNewOwner] = useState<string>("");
  const { transferOwnership, pending, error } = useTransferOwnership();
  const { indexVault } = useIndexVault();
  const factoryId = getActiveFactoryId();

  const disableContinue = useMemo(() => {
    const trimmed = newOwner.trim();
    if (!trimmed) return true;
    if (!isValidAccountId(trimmed)) return true;
    if (currentOwner && trimmed === currentOwner) return true;
    return false;
  }, [newOwner, currentOwner]);

  const resetAndClose = () => {
    setNewOwner("");
    onClose();
  };

  const confirm = async () => {
    try {
      const target = newOwner.trim();
      const { txHash } = await transferOwnership({ vault: vaultId, newOwner: target });
      await indexVault({ factoryId, vault: vaultId, txHash });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn("Transfer ownership failed", err);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Transfer vault ownership"
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || pending}>
            {pending ? "Transferring..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        {currentOwner && (
          <div className="text-xs text-secondary-text">
            Current owner: <span className="font-mono text-foreground">{currentOwner}</span>
          </div>
        )}
        <Input
          label="New owner account"
          type="text"
          inputMode="text"
          placeholder="example.near"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
        />
        {newOwner && !isValidAccountId(newOwner.trim()) && (
          <div className="text-xs text-red-500">Recipient account ID is invalid</div>
        )}
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="text-xs text-secondary-text">
          You must be the current owner. A 1 yoctoNEAR deposit is required to confirm intent.
        </div>
      </div>
    </Modal>
  );
}
