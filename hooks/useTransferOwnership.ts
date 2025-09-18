"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type TransferOwnershipParams = {
  vault: string;
  newOwner: string;
};

export type TransferOwnershipResult = { txHash: string };

export type UseTransferOwnershipResult = {
  transferOwnership: (
    params: TransferOwnershipParams
  ) => Promise<TransferOwnershipResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useTransferOwnership(): UseTransferOwnershipResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function extractTxHash(raw: unknown): string {
    if (typeof raw === "object" && raw !== null) {
      const tx = (raw as { transaction?: unknown }).transaction;
      if (typeof tx === "object" && tx !== null) {
        const hash = (tx as { hash?: unknown }).hash;
        if (typeof hash === "string" && hash.length > 0) return hash;
      }
    }
    throw new Error("Unexpected wallet outcome: missing transaction hash");
  }

  const transferOwnership = useCallback(
    async ({ vault, newOwner }: TransferOwnershipParams) => {
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
                methodName: "transfer_ownership",
                args: { new_owner: newOwner },
                gas: DEFAULT_GAS,
                deposit: ONE_YOCTO,
              },
            },
          ],
        });
        const txHash = extractTxHash(outcomeRaw);
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

  return { transferOwnership, pending, error, success };
}

