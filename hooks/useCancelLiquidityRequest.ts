"use client";

import { useCallback, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import type { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { DEFAULT_GAS, ONE_YOCTO } from "@/utils/constants";
import { getFriendlyErrorMessage } from "@/utils/errors";

export type CancelLiquidityRequestParams = {
  vault: string;
};

export type CancelLiquidityRequestResult = { txHash: string };

export type UseCancelLiquidityRequestResult = {
  cancelLiquidityRequest: (
    params: CancelLiquidityRequestParams
  ) => Promise<CancelLiquidityRequestResult>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

// Stub implementation: this hook intentionally does not call the contract yet.
// Will be implemented in a follow-up PR.
export function useCancelLiquidityRequest(): UseCancelLiquidityRequestResult {
  const { signedAccountId, wallet } = useWalletSelector();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cancelLiquidityRequest = useCallback(
    async (_: CancelLiquidityRequestParams) => {
      setPending(false);
      setError("Cancel liquidity request is not implemented yet");
      setSuccess(false);
      throw new Error("Cancel liquidity request is not implemented yet");
    },
    []
  );

  return { cancelLiquidityRequest, pending, error, success };
}
