"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Big from "big.js";
import { callViewFunction, networkFromFactoryId } from "@/utils/api/rpcClient";
import type { VaultViewState } from "@/utils/types/vault_view_state";

type StakingPoolAccountView = {
  staked_balance: string;
  unstaked_balance: string;
  can_withdraw: boolean;
};

export type DelegationSummaryEntry = {
  validator: string;
  staked_balance: string; // formatted human string, e.g. "1.23456 NEAR"
  unstaked_balance: string; // formatted human string
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

function formatYoctoNearToNear(value: string | number | null | undefined, fractionDigits = 5): string {
  try {
    const v = new Big(String(value ?? "0"));
    const near = v.div(new Big(10).pow(24));
    return `${near.toFixed(fractionDigits)} NEAR`;
  } catch {
    return `0.${"0".repeat(fractionDigits)} NEAR`;
  }
}

/**
 * Fetch vault delegations, computing the set of unique validators by combining
 * active validators with validators that have unstake entries. For each
 * validator, also fetches the staking pool view `get_account` to summarize
 * balances and withdrawability.
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

        // Build a map of validator -> UnstakeEntry[] and collect validators that have entries
        const unstakeByValidator = new Map<string, Record<string, unknown>[]>();
        for (const pair of unstake_entries) {
          if (!Array.isArray(pair) || pair.length !== 2) continue;
          const [validator, entry] = pair as [string, Record<string, unknown>];
          const arr = unstakeByValidator.get(validator) ?? [];
          arr.push(entry);
          unstakeByValidator.set(validator, arr);
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
              const entries = unstakeByValidator.get(validator) ?? [];
              // Choose the latest epoch_height if multiple entries exist
              let maxEpoch: number | undefined = undefined;
              for (const e of entries) {
                const ep = Number((e as any)?.epoch_height);
                if (Number.isFinite(ep)) {
                  if (maxEpoch === undefined || ep > maxEpoch) maxEpoch = ep;
                }
              }
              if (maxEpoch !== undefined) unstaked_at = maxEpoch;
            }

            return {
              validator,
              staked_balance: formatYoctoNearToNear(res?.staked_balance, 5),
              unstaked_balance: formatYoctoNearToNear(res?.unstaked_balance, 5),
              can_withdraw,
              ...(unstaked_at !== undefined ? { unstaked_at } : {}),
              ...(current_epoch !== null ? { current_epoch } : {}),
            };
          } catch (e) {
            // On failure, include a minimal entry and continue
            return {
              validator,
              staked_balance: formatYoctoNearToNear("0", 5),
              unstaked_balance: formatYoctoNearToNear("0", 5),
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
