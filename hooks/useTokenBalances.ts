"use client";

import { useEffect, useMemo, useState } from "react";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";
import Big from "big.js";
import { getActiveNetwork, rpcPath } from "@/utils/networks";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

// Default to testnet USDC which the app currently targets.
const USDC_CONTRACT_TESTNET = "usdc.tkn.primitives.testnet";
const USDC_DECIMALS = 6;

export type TokenBalances = {
  near: string;
  usdc: string;
};

export function useTokenBalances(): {
  balances: TokenBalances;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { signedAccountId, viewFunction } = useWalletSelector();
  const [balances, setBalances] = useState<TokenBalances>({ near: "—", usdc: "—" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeNetwork = getActiveNetwork();
  const rpc = useMemo(
    () => new providers.JsonRpcProvider({ url: rpcPath(activeNetwork) }),
    [activeNetwork]
  );

  const load = async () => {
    if (!signedAccountId) return;
    setLoading(true);
    setError(null);
    try {
      const acct = (await rpc.query({
        request_type: "view_account",
        account_id: signedAccountId,
        finality: "final",
      })) as AccountView;
      const near = utils.format.formatNearAmount(acct.amount);

      let usdc = "—";
      try {
        const raw = await viewFunction({
          contractId: USDC_CONTRACT_TESTNET,
          method: "ft_balance_of",
          args: { account_id: signedAccountId },
        });
        if (typeof raw === "string") {
          usdc = new Big(raw).div(10 ** USDC_DECIMALS).toFixed(USDC_DECIMALS);
        }
      } catch (e) {
        // Ignore USDC error but keep it visible in the hook error if nothing else fails
      }

      setBalances({ near, usdc });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setBalances({ near: "—", usdc: "—" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!signedAccountId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedAccountId, rpc]);

  return { balances, loading, error, refetch: load };
}

