"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { utils } from "near-api-js";
import { Balance } from "@/utils/balance";
import { NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";

/**
 * Hook to fetch and format the available NEAR balance of a vault contract.
 */
export function useAvailableBalance(
  vaultId?: string | null
): { balance: Balance; loading: boolean; refetch: () => void } {
  const { viewFunction } = useWalletSelector();
  const [balance, setBalance] = useState<Balance>(
    new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const fetchBalance = useCallback(async () => {
    if (!vaultId) return;
    setLoading(true);
    try {
      const available = await viewFunction({
        contractId: vaultId,
        method: "view_available_balance",
        args: {},
      });
      const rawStr = typeof available === "string" ? available : String(available);
      setBalance(new Balance(rawStr, NATIVE_DECIMALS, NATIVE_TOKEN));
    } catch {
      setBalance(new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN));
    } finally {
      setLoading(false);
    }
  }, [vaultId, viewFunction, version]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch };
}
