"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { useDelegate } from "@/hooks/useDelegate";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import Big from "big.js";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Balance } from "@/utils/balance";

// Default validators endpoint (network-aware)
const DEFAULT_VALIDATORS_ROUTE = "/api/validators";

export function DelegateDialog({
  open,
  onClose,
  vaultId,
  balance,
  loading,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  /** Balance abstraction with raw and display values. */
  balance: Balance;
  /** True while balance is loading. */
  loading?: boolean;
  onSuccess?: () => void;
}) {
  // Selected validator
  const [validator, setValidator] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const factoryId = getActiveFactoryId();
  const { data, loading: loadValidators } = useVaultDelegations(factoryId, vaultId);
  const { delegate, pending, error } = useDelegate();
  const [localError, setLocalError] = useState<string | null>(null);
  const { indexVault } = useIndexVault();

  // Fetch default validator list from server, passing current network
  const [defaultValidators, setDefaultValidators] = useState<string[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  useEffect(() => {
    let aborted = false;
    const network = getActiveNetwork();
    fetch(`${DEFAULT_VALIDATORS_ROUTE}?network=${network}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch validators: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
          if (!aborted) setDefaultValidators(data as string[]);
        } else {
          throw new Error("Invalid validator list format");
        }
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
    const m = new Map<string, Balance>();
    data?.summary?.forEach((entry) => m.set(entry.validator, entry.staked_balance));
    return m;
  }, [data]);

  // Reset selection when validator list updates
  useEffect(() => {
    if (mergedValidators.length > 0) {
      setValidator(mergedValidators[0]);
    }
  }, [mergedValidators]);

  const disableContinue = useMemo(() => {
    if (!validator || !amount) return true;
    try {
      const a = new Big(amount);
      const m = new Big(balance.toDisplay());
      // amount must be bounded by [0, max]
      return a.lt(0) || a.gt(m);
    } catch {
      return true;
    }
  }, [validator, amount, balance]);

  const resetAndClose = () => {
    setAmount("");
    onClose();
  };

  const confirm = async () => {
    setLocalError(null);
    try {
      const { txHash } = await delegate({ vault: vaultId, validator, amount });
      await indexVault({ factoryId, vault: vaultId, txHash });
      onSuccess?.();
      resetAndClose();
    } catch (err: unknown) {
      console.warn("Delegate failed", err);
      const msg = err instanceof Error ? err.message : "Delegate failed. Please try again.";
      setLocalError(msg);
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
            {mergedValidators.map((v) => {
              const bal = stakedMap.get(v);
              return (
                <option key={v} value={v}>
                  {v} ({bal ? bal.toDisplay() : `0 ${balance.symbol}`})
                </option>
              );
            })}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-secondary-text">Amount ({balance.symbol})</span>
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
