"use client";

import { useCallback, useEffect, useState } from "react";
import { useFtStorage } from "@/hooks/useFtStorage";

// Module-level in-memory cache for token storage bounds (min deposit) by tokenId
// to avoid duplicate network calls in the same session.
const BOUNDS_CACHE = new Map<string, string | null>();

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

  // use module-level BOUNDS_CACHE defined above

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
          let min = BOUNDS_CACHE.get(tokenId);
          if (min === undefined) {
            const bounds = await storageBounds(tokenId);
            min = bounds?.min ?? null;
            // Simple size cap to prevent unbounded growth
            if (BOUNDS_CACHE.size >= 100) {
              const firstKey = BOUNDS_CACHE.keys().next().value as string | undefined;
              if (firstKey) BOUNDS_CACHE.delete(firstKey);
            }
            BOUNDS_CACHE.set(tokenId, min);
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
