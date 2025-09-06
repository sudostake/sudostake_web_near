"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, ONE_YOCTO, ACTION_ACCEPT_LIQUIDITY } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type AcceptLiquidityParams = {
  vault: string;
  token: string; // NEP-141 token contract id
  amount: string; // minimal units as string
  interest: string; // minimal units as string
  collateral: string; // yoctoNEAR as string
  duration: number; // seconds
};

export type AcceptLiquidityResult = { txHash: string };

export type UseAcceptLiquidityRequestResult = {
  acceptLiquidity: (params: AcceptLiquidityParams) => Promise<AcceptLiquidityResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useAcceptLiquidityRequest(): UseAcceptLiquidityRequestResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const acceptLiquidity = useCallback(
    async ({ vault, token, amount, interest, collateral, duration }: AcceptLiquidityParams) => {
      if (!signedAccountId) throw new Error("Wallet not signed in");
      if (!wallet) throw new Error("No wallet connected");
      setPending(true);
      setError(null);
      setSuccess(false);
      try {
        const msg = JSON.stringify({
          action: ACTION_ACCEPT_LIQUIDITY,
          token,
          amount,
          interest,
          collateral,
          duration,
        });

        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: token,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer_call",
                args: {
                  receiver_id: vault,
                  amount,
                  memo: null,
                  msg,
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

  return { acceptLiquidity, pending, error, success };
}
