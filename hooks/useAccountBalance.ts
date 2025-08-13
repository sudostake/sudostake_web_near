"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";
import { getActiveNetwork, rpcPath } from "@/utils/networks";

/**
 * Hook to fetch and format the NEAR balance of a given account, with manual refetch support.
 */
export function useAccountBalance(
  accountId?: string | null
): {
  balance: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [balance, setBalance] = useState<string>("—");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const activeNetwork = getActiveNetwork();
  const rpc = useMemo(
    () => new providers.JsonRpcProvider({ url: rpcPath(activeNetwork) }),
    [activeNetwork]
  );

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    rpc
      .query({
        request_type: "view_account",
        account_id: accountId,
        finality: "final",
      })
      .then((acct: AccountView) => {
        setBalance(utils.format.formatNearAmount(acct.amount));
      })
      .catch((e: any) => {
        setError(e?.message ?? String(e));
        setBalance("—");
      })
      .finally(() => setLoading(false));
  }, [accountId, rpc, version]);

  return { balance, loading, error, refetch };
}
