"use client";

import React, { useMemo } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRepayLoan } from "@/hooks/useRepayLoan";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { formatMinimalTokenAmount } from "@/utils/format";
import { useAccountFtBalance } from "@/hooks/useAccountFtBalance";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
// Top-up and registration flows intentionally omitted for now.
import { showToast } from "@/utils/toast";
import { getFriendlyErrorMessage } from "@/utils/errors";

type Props = {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  factoryId: string;
  tokenId: string;
  principalMinimal: string;
  interestMinimal: string;
  onSuccess?: () => void;
};

export function RepayLoanDialog({
  open,
  onClose,
  vaultId,
  factoryId,
  tokenId,
  principalMinimal,
  interestMinimal,
  onSuccess,
}: Props) {
  const network = networkFromFactoryId(factoryId);
  const decimals = getTokenDecimals(tokenId, network);
  const symbol = getTokenConfigById(tokenId, network)?.symbol ?? "FT";

  const totalDueMinimal = useMemo(() => {
    try {
      return (BigInt(principalMinimal) + BigInt(interestMinimal)).toString();
    } catch {
      return "0";
    }
  }, [principalMinimal, interestMinimal]);

  const principalLabel = formatMinimalTokenAmount(principalMinimal, decimals);
  const interestLabel = formatMinimalTokenAmount(interestMinimal, decimals);
  const totalDueLabel = formatMinimalTokenAmount(totalDueMinimal, decimals);

  const { balance: vaultTokenBal, loading: balLoading, refetch: refetchVaultTokenBal } =
    useAccountFtBalance(vaultId, tokenId, symbol, network);

  const missingMinimal = useMemo(() => {
    try {
      const have = BigInt(vaultTokenBal?.minimal ?? "0");
      const need = BigInt(totalDueMinimal);
      return need > have ? (need - have).toString() : "0";
    } catch {
      return "0";
    }
  }, [vaultTokenBal?.minimal, totalDueMinimal]);

  const missingLabel = formatMinimalTokenAmount(missingMinimal, decimals);

  const { repayLoan, pending, error } = useRepayLoan();
  const { indexVault } = useIndexVault();
  // Top-up flow is omitted; instruct the user to fund the vault externally.

  const confirm = async () => {
    try {
      const { txHash } = await repayLoan({ vault: vaultId });
      await indexVault({ factoryId, vault: vaultId, txHash });
      await refetchVaultTokenBal();
      showToast("Loan repaid successfully", { variant: "success" });
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Repay loan"
      disableBackdropClose={pending}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={pending || balLoading || missingMinimal !== "0"}
            title={missingMinimal !== "0" ? `Missing ${missingLabel} ${symbol} on vault` : undefined}
            onClick={confirm}
          >
            {pending ? "Repaying…" : "Repay now"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-secondary-text">
          Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
        </div>
        <div className="rounded border bg-background p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-secondary-text">Token</div>
            <div className="font-medium truncate" title={tokenId}>{tokenId}</div>
            <div className="text-secondary-text">Principal</div>
            <div className="font-medium">{principalLabel} {symbol}</div>
            <div className="text-secondary-text">Interest</div>
            <div className="font-medium">{interestLabel} {symbol}</div>
            <div className="text-secondary-text">Total due</div>
            <div className="font-medium">{totalDueLabel} {symbol}</div>
          </div>
        </div>
        <div className="text-sm">
          <div className="text-secondary-text">Vault balance</div>
          <div className="font-medium">
            {balLoading ? "…" : `${vaultTokenBal?.toDisplay() ?? "0"} ${symbol}`}
          </div>
          {missingMinimal !== "0" && (
            <div className="mt-2 rounded border border-amber-500/30 bg-amber-100/50 text-amber-900 p-2">
              Missing {missingLabel} {symbol} on the vault to complete repayment. Top up your vault with this token, then try again.
            </div>
          )}
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}
