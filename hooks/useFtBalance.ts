"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export function useFtBalance(tokenId?: string | null) {
  const { signedAccountId, viewFunction } = useWalletSelector();
  const viewFnRef = useRef(viewFunction);
  useEffect(() => { viewFnRef.current = viewFunction; }, [viewFunction]);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tokenId || !signedAccountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await viewFnRef.current({
        contractId: tokenId,
        method: "ft_balance_of",
        args: { account_id: signedAccountId },
      });
      if (typeof res === "string") setBalance(res);
      else setBalance("0");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [tokenId, signedAccountId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { balance, loading, error, refetch: load };
}
