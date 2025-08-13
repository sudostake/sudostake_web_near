"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import { DEFAULT_GAS } from "@/utils/constants";

export type WithdrawParams = {
  vault: string;
  amount: string;
  tokenAddress?: string | null;
  to?: string | null;
};

export type WithdrawResult = {
  txHash: string;
};

export type UseWithdrawResult = {
  withdraw: (params: WithdrawParams) => Promise<WithdrawResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useWithdraw(): UseWithdrawResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const withdraw = useCallback(
    async ({ vault, amount, tokenAddress = null, to = null }: WithdrawParams) => {
      if (!signedAccountId) {
        throw new Error("Wallet not signed in");
      }
      if (!wallet) {
        throw new Error("No wallet connected");
      }
      setPending(true);
      setError(null);
      setSuccess(false);
      try {
        let rawAmount: string | null = null;
        if (tokenAddress === null) {
          rawAmount = utils.format.parseNearAmount(amount);
          if (!rawAmount) throw new Error("Invalid withdraw amount");
        } else {
          if (!amount || Number.isNaN(Number(amount))) {
            throw new Error("Invalid token withdraw amount");
          }
          rawAmount = amount;
        }

        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "withdraw_balance",
                args: {
                  token_address: tokenAddress,
                  amount: rawAmount,
                  to,
                },
                gas: DEFAULT_GAS,
                deposit: "1",
              },
            },
          ],
        });
        const outcome = outcomeRaw as FinalExecutionOutcome;
        const txHash = outcome.transaction.hash;
        setSuccess(true);
        return { txHash };
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        setSuccess(false);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [signedAccountId, wallet]
  );

  return { withdraw, pending, error, success };
}
