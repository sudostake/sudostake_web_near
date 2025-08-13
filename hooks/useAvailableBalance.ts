"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { utils } from "near-api-js";

/**
 * Hook to fetch and format the available NEAR balance of a vault contract.
 */
export function useAvailableBalance(
  vaultId?: string | null
): { balance: string; loading: boolean; refetch: () => void } {
  const { viewFunction } = useWalletSelector();
  const [balance, setBalance] = useState<string>("—");
  const [loading, setLoading] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const fetchBalance = useCallback(async () => {
    if (!vaultId) return;
    setLoading(true);
    try {
      const raw = await viewFunction({
        contractId: vaultId,
        method: "view_available_balance",
        args: {},
      });
      setBalance(
        typeof raw === "string" ? utils.format.formatNearAmount(raw) : "0"
      );
    } catch {
      setBalance("—");
    } finally {
      setLoading(false);
    }
  }, [vaultId, viewFunction, version]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch };
}
