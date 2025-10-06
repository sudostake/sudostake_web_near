"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { useDelegate } from "@/hooks/useDelegate";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { MAX_ACTIVE_VALIDATORS } from "@/utils/constants";
import Big from "big.js";
import { MaxAvailable } from "@/app/components/MaxAvailable";
import { Balance } from "@/utils/balance";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

// Default validators endpoint (network-aware)
const DEFAULT_VALIDATORS_ROUTE = "/api/validators";

export function DelegateDialog({
  open,
  onClose,
  vaultId,
  balance,
  loading,
  onSuccess,
  defaultValidator,
}: {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  /** Balance abstraction with raw and display values. */
  balance: Balance;
  /** True while balance is loading. */
  loading?: boolean;
  onSuccess?: () => void;
  /** When provided, preselect and lock modal to this validator. */
  defaultValidator?: string;
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
  const activeValidators = useMemo(() => data?.active_validators ?? [], [data?.active_validators]);
  const activeCount = activeValidators.length;
  const canAddNewValidator = activeCount < MAX_ACTIVE_VALIDATORS;

  const allKnownValidators = useMemo(() => {
    const dynamic = data?.validators ?? [];
    return Array.from(new Set([...defaultValidators, ...dynamic, ...activeValidators])).sort();
  }, [data, defaultValidators, activeValidators]);

  const existingOptions = useMemo(() => {
    // Keep existing validators visible even if not in defaults
    return Array.from(new Set([...activeValidators])).sort();
  }, [activeValidators]);

  const addableOptions = useMemo(() => {
    if (!canAddNewValidator) return [] as string[];
    return allKnownValidators.filter((v) => !activeValidators.includes(v));
  }, [allKnownValidators, activeValidators, canAddNewValidator]);
  
  // Map validator to existing staked balance
  const stakedMap = useMemo(() => {
    const m = new Map<string, Balance>();
    data?.summary?.forEach((entry) => m.set(entry.validator, entry.staked_balance));
    return m;
  }, [data]);

  // Initialize validator when dialog opens
  useEffect(() => {
    if (!open) return;
    if (defaultValidator) {
      setValidator(defaultValidator);
      return;
    }
    // Prefer an existing validator first for top-up convenience.
    if (existingOptions.length > 0) {
      setValidator(existingOptions[0]);
      return;
    }
    if (addableOptions.length > 0) {
      setValidator(addableOptions[0]);
      return;
    }
    setValidator("");
  }, [open, defaultValidator, existingOptions, addableOptions]);

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
      title={"Delegate to validator"}
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={resetAndClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={disableContinue || pending}>
            {pending ? "Delegating..." : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {
          <label className="block text-sm">
            <span className="text-secondary-text">Validator</span>
            <select
              className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={validator}
              onChange={(e) => setValidator(e.target.value)}
            >
              {(loadValidators || loadingDefaults) && <option disabled>Loading...</option>}
              {existingOptions.length > 0 && (
                <optgroup label="Existing validators">
                  {existingOptions.map((v) => {
                    const bal = stakedMap.get(v);
                    return (
                      <option key={`existing-${v}`} value={v}>
                        {v} ({bal ? bal.toDisplay() : `0 ${balance.symbol}`})
                      </option>
                    );
                  })}
                </optgroup>
              )}
              {addableOptions.length > 0 && (
                <optgroup label="Add new validator">
                  {addableOptions.map((v) => {
                    const bal = stakedMap.get(v);
                    return (
                      <option key={`add-${v}`} value={v}>
                        {v} ({bal ? bal.toDisplay() : `0 ${balance.symbol}`})
                      </option>
                    );
                  })}
                </optgroup>
              )}
            </select>
            {!canAddNewValidator && (
              <div className="mt-1 text-xs text-secondary-text">
                You already have the maximum number of active validators ({MAX_ACTIVE_VALIDATORS}). You can delegate to existing validators but cannot add a new one.
              </div>
            )}
          </label>
        }
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
