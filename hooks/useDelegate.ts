"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import { DEFAULT_GAS } from "@/utils/constants";

/**
 * Parameters for delegating NEAR tokens from a vault contract to a validator.
 */
export type DelegateParams = {
  /** The vault account ID from which to delegate. */
  vault: string;
  /** Validator account ID to delegate to. */
  validator: string;
  /** Amount to delegate in NEAR (user-friendly format, e.g. "1.23"). */
  amount: string;
};

/**
 * Result of a successful delegate operation.
 */
export type DelegateResult = {
  /** Transaction hash of the delegate call. */
  txHash: string;
};

/**
 * Hook for delegating NEAR tokens from the user's vault to a staking pool validator.
 */
export type UseDelegateResult = {
  /** Initiates the delegate; returns transaction details when complete. */
  delegate: (params: DelegateParams) => Promise<DelegateResult>;
  /** True while the delegate transaction is in flight. */
  pending: boolean;
  /** Error message if the last delegate failed. */
  error: string | null;
  /** True if the last delegate succeeded. */
  success: boolean;
};

export function useDelegate(): UseDelegateResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const delegate = useCallback(
    async ({ vault, validator, amount }: DelegateParams) => {
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
        const rawAmount = utils.format.parseNearAmount(amount);
        if (!rawAmount) {
          throw new Error("Invalid delegate amount");
        }
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "delegate",
                args: { validator, amount: rawAmount },
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

  return { delegate, pending, error, success };
}
