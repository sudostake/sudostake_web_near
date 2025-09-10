"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type ProcessClaimsParams = { vault: string };
export type ProcessClaimsResult = { txHash: string };

export type UseProcessClaimsResult = {
  processClaims: (params: ProcessClaimsParams) => Promise<ProcessClaimsResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useProcessClaims(): UseProcessClaimsResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processClaims = useCallback(
    async ({ vault }: ProcessClaimsParams) => {
      if (!signedAccountId) throw new Error("Wallet not signed in");
      if (!wallet) throw new Error("No wallet connected");
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
                methodName: "process_claims",
                args: {},
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

  return { processClaims, pending, error, success };
}

