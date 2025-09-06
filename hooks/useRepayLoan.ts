"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type RepayLoanParams = {
  vault: string;
};

export type RepayLoanResult = { txHash: string };

export type UseRepayLoanResult = {
  repayLoan: (params: RepayLoanParams) => Promise<RepayLoanResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useRepayLoan(): UseRepayLoanResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const repayLoan = useCallback(
    async ({ vault }: RepayLoanParams) => {
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
                methodName: "repay_loan",
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

  return { repayLoan, pending, error, success };
}

