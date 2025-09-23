"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Big from "big.js";
import { Balance } from "@/utils/balance";
import { NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";
import { callViewFunction, networkFromFactoryId } from "@/utils/api/rpcClient";
import type { VaultViewState } from "@/utils/types/vault_view_state";


type StakingPoolAccountView = {
  staked_balance: string;
  unstaked_balance: string;
  can_withdraw: boolean;
};

export type DelegationSummaryEntry = {
  validator: string;
  /** Staked and unstaked balances with raw & display. */
  staked_balance: Balance;
  unstaked_balance: Balance;
  can_withdraw: boolean;
  unstaked_at?: number; // epoch height of the (latest) unstake
  current_epoch?: number;
};

export type UseVaultDelegationsData = {
  validators: string[];
  current_epoch: number | null;
  summary: DelegationSummaryEntry[];
  // Provide raw fields for flexibility in consumers
  active_validators: string[];
  unstake_entries: Array<[string, Record<string, unknown>]>;
};

export type UseVaultDelegationsResult = {
  data: UseVaultDelegationsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};


/**
 * React hook for fetching vault delegations and building a concise summary.
 *
 * This combines
 * 1) The contract's active validators list, and
 * 2) The UnorderedMap of unstake_entries (one entry per validator: {amount, epoch_height}).
 *
 * For each unique validator, it invokes the staking pool's view_account to retrieve
 * staked and unstaked balances, wraps them in Balance objects, and computes withdrawability.
 *
 * Returns:
 * - data: { validators, current_epoch, summary[], active_validators, unstake_entries }
 * - loading, error, refetch()
 *
 * Where summary[] is an array of DelegationSummaryEntry { validator, staked_balance, unstaked_balance, can_withdraw, unstaked_at?, current_epoch? }
 */
export function useVaultDelegations(
  factoryId?: string | null,
  vaultId?: string | null
): UseVaultDelegationsResult {
  const [data, setData] = useState<UseVaultDelegationsResult["data"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const canQuery = useMemo(() => Boolean(factoryId && vaultId), [factoryId, vaultId]);
  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    setError(null);
    if (!canQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    let aborted = false;
    const network = networkFromFactoryId(factoryId ?? undefined);

    const run = async () => {
      setLoading(true);
      try {
        const state = await callViewFunction<VaultViewState>(String(vaultId), "get_vault_state", {}, { network });
        if (aborted) return;

        const current_epoch = typeof state?.current_epoch === "number" ? state.current_epoch : null;
        const active_validators = Array.isArray(state?.active_validators) ? state.active_validators : [];
        const unstake_entries = Array.isArray(state?.unstake_entries) ? state.unstake_entries : [];

        // Build a map of validator -> UnstakeEntry[] based on on-chain unstake entries
        type UnstakeEntry = { amount: string; epoch_height: number };
        // Each validator maps to exactly one UnstakeEntry on-chain
        const unstakeByValidator = new Map<string, UnstakeEntry>();
        for (const pair of unstake_entries) {
          if (!Array.isArray(pair) || pair.length !== 2) continue;
          const [validator, entry] = pair as [string, Record<string, unknown>];
          // UnorderedMap<validator, UnstakeEntry> ensures a single entry per validator
          unstakeByValidator.set(
            validator,
            entry as UnstakeEntry
          );
        }

        const unstake_validators = new Set<string>(unstakeByValidator.keys());
        const all = new Set<string>([...active_validators, ...unstake_validators]);
        const validators = Array.from(all).sort();

        // Fetch each validator's `get_account` for the vault
        const tasks = validators.map(async (validator): Promise<DelegationSummaryEntry> => {
          try {
            const res = await callViewFunction<StakingPoolAccountView>(
              validator,
              "get_account",
              { account_id: vaultId },
              { network }
            );

            const can_withdraw = Boolean(res?.can_withdraw);
            let unstaked_at: number | undefined;
            if (!can_withdraw) {
              const entry = unstakeByValidator.get(validator);
              if (entry && Number.isFinite(entry.epoch_height)) {
                unstaked_at = entry.epoch_height;
              }
            }

            return {
              validator,
              staked_balance: new Balance(res?.staked_balance ?? "0", NATIVE_DECIMALS, NATIVE_TOKEN),
              unstaked_balance: new Balance(res?.unstaked_balance ?? "0", NATIVE_DECIMALS, NATIVE_TOKEN),
              can_withdraw,
              ...(unstaked_at !== undefined ? { unstaked_at } : {}),
              ...(current_epoch !== null ? { current_epoch } : {}),
            };
          } catch (e) {
            // On failure, include a minimal entry and continue
            return {
              validator,
              staked_balance: new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN),
              unstaked_balance: new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN),
              can_withdraw: false,
              ...(current_epoch !== null ? { current_epoch } : {}),
            };
          }
        });
        const summary: DelegationSummaryEntry[] = await Promise.all(tasks);
        if (aborted) return;

        setData({ validators, current_epoch, summary, active_validators, unstake_entries });
      } catch (e: unknown) {
        if (aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setData(null);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    run();
    return () => {
      aborted = true;
    };
  }, [canQuery, factoryId, vaultId, version]);

  return { data, loading, error, refetch };
}

export async function fetchVaultViewState(
  vaultId: string,
  factoryId?: string | null
): Promise<VaultViewState> {
  const network = networkFromFactoryId(factoryId ?? undefined);
  return await callViewFunction<VaultViewState>(vaultId, "get_vault_state", {}, { network });
}
