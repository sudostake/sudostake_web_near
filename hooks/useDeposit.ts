"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { utils } from "near-api-js";

/**
 * Parameters for depositing NEAR tokens into a vault contract.
 */
export type DepositParams = {
  /** The vault account ID receiving the deposit. */
  vault: string;
  /** Amount to deposit in NEAR (user-friendly format, e.g. "1.23"). */
  amount: string;
};

/**
 * Result of a successful deposit operation.
 */
export type DepositResult = {
  /** Transaction hash of the deposit call. */
  txHash: string;
};

/**
 * Hook for depositing NEAR tokens from the user's account into a vault.
 */
export type UseDepositResult = {
  /** Initiates the deposit; returns transaction details when complete. */
  deposit: (params: DepositParams) => Promise<DepositResult>;
  /** True while the deposit transaction is in flight. */
  pending: boolean;
  /** Error message if the last deposit failed. */
  error: string | null;
  /** True if the last deposit succeeded. */
  success: boolean;
};

export function useDeposit(): UseDepositResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deposit = useCallback(
    async ({ vault, amount }: DepositParams) => {
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
        const yocto = utils.format.parseNearAmount(amount);
        if (!yocto) {
          throw new Error("Invalid deposit amount");
        }
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: vault,
          actions: [{ type: "Transfer", params: { deposit: yocto } }],
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

  return { deposit, pending, error, success };
}
