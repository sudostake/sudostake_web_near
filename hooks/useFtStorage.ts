"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type StorageBalance = {
  total: string;
  available: string;
} | null;

export type StorageBounds = {
  min: string; // yoctoNEAR
  max: string; // yoctoNEAR
};

export function useFtStorage() {
  const { viewFunction, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageBalanceOf = useCallback(
    async (tokenId: string, accountId: string): Promise<StorageBalance> => {
      try {
        const res = await viewFunction({
          contractId: tokenId,
          method: "storage_balance_of",
          args: { account_id: accountId },
        });
        if (res === null) return null;
        if (typeof res === "object" && res) return res as StorageBalance;
        return null;
      } catch {
        return null;
      }
    },
    [viewFunction]
  );

  const storageBounds = useCallback(
    async (tokenId: string): Promise<StorageBounds | null> => {
      try {
        const res = await viewFunction({
          contractId: tokenId,
          method: "storage_balance_bounds",
          args: {},
        });
        if (typeof res === "object" && res && "min" in res && "max" in res) {
          const { min, max } = res as { min: string; max: string };
          return { min, max };
        }
        return null;
      } catch {
        return null;
      }
    },
    [viewFunction]
  );

  const registerStorage = useCallback(
    async (tokenId: string, accountId: string, depositYocto: string): Promise<string> => {
      if (!wallet) throw new Error("No wallet connected");
      setPending(true);
      setError(null);
      try {
        const outcomeRaw = await wallet.signAndSendTransaction({
          receiverId: tokenId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: { account_id: accountId, registration_only: true },
                gas: DEFAULT_GAS,
                deposit: depositYocto,
              },
            },
          ],
        });
        const outcome = outcomeRaw as FinalExecutionOutcome;
        return outcome.transaction.hash;
      } catch (e) {
        setError(getFriendlyErrorMessage(e));
        throw e;
      } finally {
        setPending(false);
      }
    },
    [wallet]
  );

  return { storageBalanceOf, storageBounds, registerStorage, pending, error };
}

