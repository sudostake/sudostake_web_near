"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

/**
 * Parameters for claiming unstaked NEAR tokens from a vault contract for a validator.
 */
export type ClaimUnstakedParams = {
  /** The vault account ID from which to claim unstaked balance. */
  vault: string;
  /** Validator account ID whose unstaked balance to claim. */
  validator: string;
};

/**
 * Result of a successful claim_unstaked operation.
 */
export type ClaimUnstakedResult = {
  /** Transaction hash of the claim_unstaked call. */
  txHash: string;
};

/**
 * Hook for claiming unstaked NEAR tokens from the user's vault contract.
 */
export type UseClaimUnstakedResult = {
  /** Initiates the claim_unstaked; returns transaction details when complete. */
  claimUnstaked: (params: ClaimUnstakedParams) => Promise<ClaimUnstakedResult>;
  /** True while the claim_unstaked transaction is in flight. */
  pending: boolean;
  /** Error message if the last claim_unstaked failed. */
  error: string | null;
  /** True if the last claim_unstaked succeeded. */
  success: boolean;
};

export function useClaimUnstaked(): UseClaimUnstakedResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const claimUnstaked = useCallback(
    async ({ vault, validator }: ClaimUnstakedParams) => {
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
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "claim_unstaked",
                args: { validator },
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

  return { claimUnstaked, pending, error, success };
}
