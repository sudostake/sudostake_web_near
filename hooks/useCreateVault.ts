"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, MINT_VAULT_METHOD, VAULT_CREATION_FEE } from "@/utils/constants";

export type CreateVaultParams = {
  factoryId: string;
};

export type CreateVaultResult = {
  vaultId: string;
  txHash: string;
};
export type UseCreateVaultResult = {
  createVault: (params: CreateVaultParams) => Promise<CreateVaultResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useCreateVault(): UseCreateVaultResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createVault = useCallback(async ({ factoryId }: CreateVaultParams) => {
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
        receiverId: factoryId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: MINT_VAULT_METHOD,
              args: {},
              gas: DEFAULT_GAS,
              deposit: VAULT_CREATION_FEE,
            },
          },
        ],
      });
      const outcome = outcomeRaw as FinalExecutionOutcome;
      // Extract vault account ID from emitted EVENT_JSON log
      let vaultId: string | undefined;
      for (const receipt of outcome.receipts_outcome || []) {
        for (const log of receipt.outcome.logs) {
          if (log.startsWith("EVENT_JSON:")) {
            const payload = JSON.parse(log.split("EVENT_JSON:")[1]);
            if (payload.event === "vault_minted") {
              vaultId = payload.data.vault;
              break;
            }
          }
        }
        if (vaultId) break;
      }
      if (!vaultId) {
        throw new Error("vault_minted event not found in transaction logs");
      }
      const txHash = outcome.transaction.hash;
      setSuccess(true);
      return { vaultId, txHash };
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSuccess(false);
      throw e;
    } finally {
      setPending(false);
    }
  }, [signedAccountId, wallet]);

  return { createVault, pending, error, success };
}
