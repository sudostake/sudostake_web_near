"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

/**
 * Parameters for undelegating NEAR tokens from a vault contract for a validator.
 */
export type UndelegateParams = {
  /** The vault account ID from which to undelegate. */
  vault: string;
  /** Validator account ID to undelegate from. */
  validator: string;
  /** Amount to undelegate in NEAR (user-friendly format, e.g. "1.23"). */
  amount: string;
};

/**
 * Result of a successful undelegate operation.
 */
export type UndelegateResult = {
  /** Transaction hash of the undelegate call. */
  txHash: string;
};

/**
 * Hook for undelegating NEAR tokens from the user's vault to a staking pool validator.
 */
export type UseUndelegateResult = {
  /** Initiates the undelegate; returns transaction details when complete. */
  undelegate: (params: UndelegateParams) => Promise<UndelegateResult>;
  /** True while the undelegate transaction is in flight. */
  pending: boolean;
  /** Error message if the last undelegate failed. */
  error: string | null;
  /** True if the last undelegate succeeded. */
  success: boolean;
};

export function useUndelegate(): UseUndelegateResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const undelegate = useCallback(
    async ({ vault, validator, amount }: UndelegateParams) => {
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
          throw new Error("Invalid undelegate amount");
        }
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "undelegate",
                args: { validator, amount: rawAmount },
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

  return { undelegate, pending, error, success };
}
