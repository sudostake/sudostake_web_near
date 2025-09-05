"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import Big from "big.js";
import { DEFAULT_GAS, ONE_YOCTO, SECONDS_PER_DAY } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";
import { getActiveNetwork } from "@/utils/networks";
import { getTokenDecimals } from "@/utils/tokens";

// Big.js rounding mode: RoundDown
const BIG_JS_ROUND_DOWN = 0 as const;

export type RequestLiquidityParams = {
  vault: string;
  token: string; // NEP-141 token contract id
  amount: string; // display amount in token units (e.g., "100.5" USDC)
  interest: string; // interest in token units (display), e.g., "1.25" USDC
  collateral_near: string; // display amount in NEAR (e.g., "10")
  duration_days: number; // requested duration in days
};

export type RequestLiquidityResult = { txHash: string };

export type UseRequestLiquidityResult = {
  requestLiquidity: (params: RequestLiquidityParams) => Promise<RequestLiquidityResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

function toMinimalTokenAmount(display: string, decimals: number): string {
  const v = new Big(display || "0");
  const scaled = v.times(new Big(10).pow(decimals));
  // Avoid scientific notation; contract expects string integer
  return scaled.round(0, BIG_JS_ROUND_DOWN).toString();
}

export function useRequestLiquidity(): UseRequestLiquidityResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestLiquidity = useCallback(
    async ({ vault, token, amount, interest, collateral_near, duration_days }: RequestLiquidityParams) => {
      if (!signedAccountId) throw new Error("Wallet not signed in");
      if (!wallet) throw new Error("No wallet connected");
      setPending(true);
      setError(null);
      setSuccess(false);
      try {
        const network = getActiveNetwork();
        const decimals = getTokenDecimals(token, network);
        const amountMinimal = toMinimalTokenAmount(amount, decimals);
        const interestMinimal = toMinimalTokenAmount(interest, decimals);
        const collateral = utils.format.parseNearAmount(collateral_near);
        if (!collateral) throw new Error("Invalid collateral amount");
        // Round to the nearest second to match UI expectations when fractional days are provided
        const duration = Math.max(1, Math.round(Number(duration_days) * SECONDS_PER_DAY));

        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "request_liquidity",
                args: {
                  token,
                  amount: amountMinimal,
                  interest: interestMinimal,
                  collateral,
                  duration,
                },
                gas: DEFAULT_GAS,
                deposit: ONE_YOCTO,
              },
            },
          ],
        });
        const outcome = outcomeRaw as FinalExecutionOutcome;
        const txHash = outcome.transaction.hash;
        setSuccess(true);
        return { txHash };
      } catch (e) {
        setError(getFriendlyErrorMessage(e));
        setSuccess(false);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [signedAccountId, wallet]
  );

  return { requestLiquidity, pending, error, success };
}
