"use client";

import { useEffect, useMemo, useState } from "react";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";
import Big from "big.js";
import { getActiveNetwork, rpcPath } from "@/utils/networks";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { USDC_DECIMALS, NATIVE_DECIMALS, NATIVE_TOKEN } from "@/utils/constants";
import { Balance } from "@/utils/balance";
// Symbol for USDC token
const USDC_TOKEN = "USDC";

export type TokenBalances = {
  near: Balance;
  usdc: Balance;
};

export function useTokenBalances(): {
  balances: TokenBalances;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { signedAccountId, viewFunction } = useWalletSelector();
  const [balances, setBalances] = useState<TokenBalances>({
    near: new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN),
    usdc: new Balance("0", USDC_DECIMALS, USDC_TOKEN),
  });
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
      const rawNear = acct.amount;
      const displayNear = utils.format.formatNearAmount(rawNear);

      let rawUsdc = "0";
      let displayUsdc = "—";
      try {
        const rawBalance = await viewFunction({
          contractId: "usdc.tkn.primitives.testnet",
          method: "ft_balance_of",
          args: { account_id: signedAccountId },
        });
        if (typeof rawBalance === "string") {
          rawUsdc = rawBalance;
          displayUsdc = new Big(rawBalance)
            .div(10 ** USDC_DECIMALS)
            .toFixed(USDC_DECIMALS);
        }
      } catch {
        // ignore USDC errors
      }

      setBalances({
        near: new Balance(rawNear, NATIVE_DECIMALS, NATIVE_TOKEN),
        usdc: new Balance(rawUsdc, USDC_DECIMALS, USDC_TOKEN),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setBalances({
        near: new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN),
        usdc: new Balance("0", USDC_DECIMALS, USDC_TOKEN),
      });
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
