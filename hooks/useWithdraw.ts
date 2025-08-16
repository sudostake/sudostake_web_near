"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import Big from "big.js";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type WithdrawParams = {
  vault: string;
  amount: string;
  tokenAddress?: string | null;
  /**
   * Optional decimals for the NEP-141 token. If provided with tokenAddress,
   * the amount is treated as a human-friendly decimal and will be converted
   * to the token's minimal units. If omitted, amount is expected to already
   * be in minimal units (integer string).
   */
  tokenDecimals?: number | null;
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
    async ({ vault, amount, tokenAddress = null, tokenDecimals = null, to = null }: WithdrawParams) => {
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
          if (tokenDecimals !== null && tokenDecimals !== undefined) {
            // Validate format: up to tokenDecimals fractional digits
            if (!/^\d+(?:\.\d+)?$/.test(amount)) {
              throw new Error("Invalid token amount format");
            }
            const [, frac = ""] = amount.split(".");
            if (frac.length > tokenDecimals) {
              throw new Error(`Amount has more than ${tokenDecimals} decimal places`);
            }
            try {
              const scaled = new Big(amount).times(new Big(10).pow(tokenDecimals));
              if (scaled.lte(0)) throw new Error("Amount must be greater than zero");
              rawAmount = scaled.toFixed(0);
            } catch (e) {
              throw new Error("Failed to normalize token amount");
            }
          } else {
            // Expect minimal units (integer string)
            if (!/^\d+$/.test(amount)) {
              throw new Error("Token amount must be an integer string in minimal units");
            }
            if (new Big(amount).lte(0)) {
              throw new Error("Amount must be greater than zero");
            }
            rawAmount = amount;
          }
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
                deposit: ONE_YOCTO,
              },
            },
          ],
        });
        const outcome = outcomeRaw as FinalExecutionOutcome;
        const txHash = outcome.transaction.hash;
        setSuccess(true);
        return { txHash };
      } catch (e: unknown) {
        setError(getFriendlyErrorMessage(e));
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
