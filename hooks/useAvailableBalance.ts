"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { utils } from "near-api-js";
import Big from "big.js";
import { Balance } from "@/utils/balance";
import { NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";

/**
 * Hook to fetch and format the available NEAR balance of a vault contract.
 */
export function useAvailableBalance(
  vaultId?: string | null
): { balance: Balance; loading: boolean; refetch: () => void } {
  const { viewFunction } = useWalletSelector();
  // Stabilize viewFunction to avoid effect churn if its identity changes
  const viewFnRef = useRef(viewFunction);
  useEffect(() => { viewFnRef.current = viewFunction; }, [viewFunction]);
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
      const available = await viewFnRef.current({
        contractId: vaultId,
        method: "view_available_balance",
        args: {},
      });
      let rawStr: string;
      if (typeof available === "string") rawStr = available;
      else if (typeof available === "number") {
        try {
          rawStr = new Big(available).toFixed(0);
        } catch {
          if (Number.isSafeInteger(available)) {
            rawStr = available.toString();
          } else {
            try { rawStr = BigInt(available).toString(); }
            catch { rawStr = String(Math.trunc(available)); }
          }
        }
      } else if (typeof available === "bigint") rawStr = available.toString();
      else rawStr = String(available);
      setBalance(new Balance(rawStr, NATIVE_DECIMALS, NATIVE_TOKEN));
    } catch {
      setBalance(new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN));
    } finally {
      setLoading(false);
    }
  }, [vaultId, version]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch };
}
