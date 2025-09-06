"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type FtTransferParams = {
  token: string; // NEP-141 token contract id
  receiverId: string; // target account id to receive tokens
  amount: string; // minimal units as string
  memo?: string;
};

export type FtTransferResult = { txHash: string };

export type UseFtTransferResult = {
  ftTransfer: (params: FtTransferParams) => Promise<FtTransferResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useFtTransfer(): UseFtTransferResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ftTransfer = useCallback(
    async ({ token, receiverId, amount, memo }: FtTransferParams) => {
      if (!signedAccountId) throw new Error("Wallet not signed in");
      if (!wallet) throw new Error("No wallet connected");
      setPending(true);
      setError(null);
      setSuccess(false);
      try {
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: token,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer",
                args: { receiver_id: receiverId, amount, memo },
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

  return { ftTransfer, pending, error, success };
}
