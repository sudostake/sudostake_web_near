"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Balance } from "@/utils/balance";
import { getTokenDecimals } from "@/utils/tokens";
import type { Network } from "@/utils/networks";

export type UseAccountFtBalanceResult = {
  balance: Balance | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Fetch an FT (NEP-141) token balance for an arbitrary account.
 */
export function useAccountFtBalance(
  accountId?: string | null,
  tokenId?: string | null,
  symbol: string = "FT",
  network?: Network
): UseAccountFtBalanceResult {
  const { viewFunction } = useWalletSelector();
  const [raw, setRaw] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountId || !tokenId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await viewFunction({
        contractId: tokenId,
        method: "ft_balance_of",
        args: { account_id: accountId },
      });
      setRaw(typeof res === "string" ? res : "0");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRaw(null);
    } finally {
      setLoading(false);
    }
  }, [accountId, tokenId, viewFunction]);

  useEffect(() => {
    void load();
  }, [load]);

  const decimals = useMemo(() => {
    if (!tokenId) return undefined as number | undefined;
    return network ? getTokenDecimals(tokenId, network) : getTokenDecimals(tokenId);
  }, [tokenId, network]);

  const balance = useMemo(() => {
    if (!tokenId || decimals === undefined) return null;
    return new Balance(raw ?? "0", decimals, symbol);
  }, [raw, tokenId, symbol, decimals]);

  return { balance, loading, error, refetch: load };
}
