"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { useDelegate } from "@/hooks/useDelegate";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId } from "@/utils/networks";
import { parseNumber } from "@/utils/format";
import { getActiveNetwork } from "@/utils/networks";

// Default validators endpoint (network-aware)
const DEFAULT_VALIDATORS_ROUTE = "/api/validators";

export function DelegateDialog({
  open,
  onClose,
  vaultId,
  availableBalance,
  availableLoading,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  availableBalance?: string | null;
  availableLoading?: boolean;
  onSuccess?: () => void;
}) {
  // Selected validator
  const [validator, setValidator] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const factoryId = getActiveFactoryId();
  const { data, loading: loadValidators } = useVaultDelegations(factoryId, vaultId);
  const { delegate, pending, error } = useDelegate();
  const { indexVault } = useIndexVault();

  // Fetch default validator list from server, passing current network
  const [defaultValidators, setDefaultValidators] = useState<string[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  useEffect(() => {
    let aborted = false;
    const network = getActiveNetwork();
    fetch(`${DEFAULT_VALIDATORS_ROUTE}?network=${network}`)
      .then((res) => res.json())
      .then((list: string[]) => {
        if (!aborted) setDefaultValidators(list);
      })
      .catch((err) => console.warn("Failed to fetch validators", err))
      .finally(() => {
        if (!aborted) setLoadingDefaults(false);
      });
    return () => {
      aborted = true;
    };
  }, []);

  // Merge default validators with those from vault delegations
  const mergedValidators = useMemo(() => {
    const dynamic = data?.validators ?? [];
    const unique = Array.from(new Set([...defaultValidators, ...dynamic]));
    return unique.sort();
  }, [data, defaultValidators]);
  // Map validator to existing staked balance
  const stakedMap = useMemo(() => {
    const m = new Map<string, string>();
    data?.summary?.forEach((entry) => m.set(entry.validator, entry.staked_balance));
    return m;
  }, [data]);

  // Reset selection when validator list updates
  useEffect(() => {
    if (mergedValidators.length > 0) {
      setValidator(mergedValidators[0]);
    }
  }, [mergedValidators]);

  const numeric = parseNumber(availableBalance);
  const maxAmount = Number.isNaN(numeric) ? 0 : numeric;
  const amountNum = Number(amount);
  const disableContinue =
    !validator ||
    !amount ||
    Number.isNaN(amountNum) ||
    amountNum <= 0 ||
    amountNum > maxAmount;

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    try {
      const { txHash } = await delegate({ vault: vaultId, validator, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
    } catch (err) {
      console.warn("Delegate failed", err);
    } finally {
      resetAndClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Delegate to validator"
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
            {pending ? "Delegating..." : "Continue"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <label className="block text-sm">
          <span className="text-secondary-text">Validator</span>
          <select
            className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
            value={validator}
            onChange={(e) => setValidator(e.target.value)}
          >
            {(loadValidators || loadingDefaults) && <option disabled>Loading...</option>}
            {mergedValidators.map((v) => (
              <option key={v} value={v}>
                {v} ({stakedMap.get(v) ?? "0 NEAR"})
              </option>
            ))}
          </select>
        </label>
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
          <div>
            Max available: {availableLoading ? "…" : availableBalance} NEAR
          </div>
          <button
            type="button"
            className="underline disabled:no-underline disabled:opacity-60"
            disabled={availableLoading}
            onClick={() => {
              if (maxAmount > 0) setAmount(maxAmount.toString());
            }}
          >
            Max
          </button>
        </div>
      </div>
    </Modal>
  );
}
