"use client";

import { useCallback, useEffect, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export type TokenMetadata = {
  symbol?: string;
  name?: string;
  decimals?: number;
};

export function useTokenMetadata(tokenId?: string | null) {
  const { viewFunction } = useWalletSelector();
  const [meta, setMeta] = useState<TokenMetadata>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tokenId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await viewFunction({ contractId: tokenId, method: "ft_metadata", args: {} });
      if (res && typeof res === "object") {
        const obj = res as Record<string, unknown>;
        const symbol = typeof obj.symbol === "string" ? obj.symbol : undefined;
        const name = typeof obj.name === "string" ? obj.name : undefined;
        const decimals = typeof obj.decimals === "number" ? obj.decimals : undefined;
        setMeta({ symbol, name, decimals });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMeta({});
    } finally {
      setLoading(false);
    }
  }, [tokenId, viewFunction]);

  useEffect(() => { void load(); }, [load]);

  return { meta, loading, error, refetch: load } as const;
}

