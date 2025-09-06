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
          const bounds = await storageBounds(tokenId);
          if (cancelled) return;
          setMinDeposit(bounds?.min ?? null);
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

