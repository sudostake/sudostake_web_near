"use client";

import { useCallback, useEffect, useState } from "react";
import { useFtStorage } from "@/hooks/useFtStorage";

export type UseTokenRegistrationResult = {
  registered: boolean | null;
  minDeposit: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Fetch registration status and minimum storage deposit for a given account on a token contract.
 */
export function useTokenRegistration(tokenId?: string | null, accountId?: string | null): UseTokenRegistrationResult {
  const { storageBalanceOf, storageBounds, error: storageError } = useFtStorage();
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [minDeposit, setMinDeposit] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  // Simple in-memory cache for token bounds to avoid duplicate network calls
  // across multiple consumers within the same session/render lifecycle.
  // Only caches the `min` value which is all we need for registration.
  const staticCache: Map<string, string | null> = (useTokenRegistration as unknown as { __boundsCache?: Map<string, string | null> }).__boundsCache ?? new Map();
  (useTokenRegistration as unknown as { __boundsCache?: Map<string, string | null> }).__boundsCache = staticCache;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!tokenId || !accountId) {
        setRegistered(null);
        setMinDeposit(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const bal = await storageBalanceOf(tokenId, accountId);
        if (cancelled) return;
        const isReg = bal !== null;
        setRegistered(isReg);
        if (!isReg) {
          let min = staticCache.get(tokenId);
          if (min === undefined) {
            const bounds = await storageBounds(tokenId);
            min = bounds?.min ?? null;
            staticCache.set(tokenId, min);
          }
          if (cancelled) return;
          setMinDeposit(min ?? null);
        } else {
          setMinDeposit(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [tokenId, accountId, storageBalanceOf, storageBounds, version]);

  return { registered, minDeposit, loading, error: storageError ?? null, refresh };
}
