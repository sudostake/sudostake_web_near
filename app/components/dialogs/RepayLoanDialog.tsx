"use client";

import React, { useMemo } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { useRepayLoan } from "@/hooks/useRepayLoan";
import { useIndexVault } from "@/hooks/useIndexVault";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { formatMinimalTokenAmount } from "@/utils/format";
import { useAccountFtBalance } from "@/hooks/useAccountFtBalance";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useFtStorage } from "@/hooks/useFtStorage";
import { useFtTransfer } from "@/hooks/useFtTransfer";
import { useFtBalance } from "@/hooks/useFtBalance";
import { showToast } from "@/utils/toast";
import { getFriendlyErrorMessage } from "@/utils/errors";
import { utils } from "near-api-js";

const TOP_UP_MEMO = "Vault top-up for loan repayment";

type Props = {
  open: boolean;
  onClose: () => void;
  vaultId: string;
  factoryId: string;
  tokenId: string;
  principalMinimal: string;
  interestMinimal: string;
  onSuccess?: () => void;
  onVaultTokenBalanceChange?: () => void;
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
  onVaultTokenBalanceChange,
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
  const { signedAccountId } = useWalletSelector();
  const { storageBalanceOf, storageBounds, registerStorage, pending: regPending, error: regError } = useFtStorage();
  const { ftTransfer, pending: transferPending, error: transferError } = useFtTransfer();
  const { balance: ownerTokenBal, loading: ownerBalLoading } = useFtBalance(tokenId);

  const ownerBalanceLabel = useMemo(() => {
    if (!ownerTokenBal) return "—";
    return formatMinimalTokenAmount(ownerTokenBal, decimals);
  }, [ownerTokenBal, decimals]);

  const ownerHasEnough = useMemo(() => {
    try {
      if (!ownerTokenBal) return false;
      return BigInt(ownerTokenBal) >= BigInt(missingMinimal);
    } catch { return false; }
  }, [ownerTokenBal, missingMinimal]);

  const [ownerRegistered, setOwnerRegistered] = React.useState<boolean | null>(null);
  const [ownerMinDeposit, setOwnerMinDeposit] = React.useState<string | null>(null);
  const [vaultRegistered, setVaultRegistered] = React.useState<boolean | null>(null);
  const [vaultMinDeposit, setVaultMinDeposit] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!signedAccountId) { setOwnerRegistered(null); setOwnerMinDeposit(null); return; }
      const bal = await storageBalanceOf(tokenId, signedAccountId);
      if (cancelled) return;
      const reg = bal !== null;
      setOwnerRegistered(reg);
      if (!reg) {
        const b = await storageBounds(tokenId);
        if (cancelled) return;
        setOwnerMinDeposit(b?.min ?? null);
      } else {
        setOwnerMinDeposit(null);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [signedAccountId, tokenId, storageBalanceOf, storageBounds]);

  // Check vault registration for the token (edge case after acceptance)
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      const bal = await storageBalanceOf(tokenId, vaultId);
      if (cancelled) return;
      const isReg = bal !== null;
      setVaultRegistered(isReg);
      if (!isReg) {
        const bounds = await storageBounds(tokenId);
        if (cancelled) return;
        setVaultMinDeposit(bounds?.min ?? null);
      } else {
        setVaultMinDeposit(null);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [tokenId, vaultId, storageBalanceOf, storageBounds]);

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

  const onRegisterOwner = async () => {
    if (!signedAccountId || !ownerMinDeposit) return;
    try {
      await registerStorage(tokenId, signedAccountId, ownerMinDeposit);
      const bal = await storageBalanceOf(tokenId, signedAccountId);
      setOwnerRegistered(bal !== null);
      showToast("Registration successful", { variant: "success" });
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  const onTopUp = async () => {
    if (!signedAccountId || missingMinimal === "0") return;
    try {
      await ftTransfer({ token: tokenId, receiverId: vaultId, amount: missingMinimal, memo: TOP_UP_MEMO });
      await refetchVaultTokenBal();
      showToast(`Transferred ${missingLabel} ${symbol} to vault`, { variant: "success" });
      onVaultTokenBalanceChange?.();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  const onRegisterVault = async () => {
    if (!vaultMinDeposit) return;
    try {
      await registerStorage(tokenId, vaultId, vaultMinDeposit);
      const bal = await storageBalanceOf(tokenId, vaultId);
      setVaultRegistered(bal !== null);
      showToast("Vault registered with token", { variant: "success" });
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
              <div>Missing {missingLabel} {symbol} on the vault to complete repayment.</div>
              <div className="mt-1 text-secondary-text">
                Your balance: <span className="font-medium text-foreground">{ownerBalLoading ? "…" : `${ownerBalanceLabel} ${symbol}`}</span>
              </div>
              {vaultRegistered === false ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={onRegisterVault}
                    disabled={regPending || !vaultMinDeposit}
                    className="inline-flex items-center gap-2 px-3 h-8 rounded bg-primary text-primary-text disabled:opacity-50"
                  >
                    {regPending ? "Registering…" : "Register vault with token"}
                  </button>
                  {vaultMinDeposit && (
                    <div className="mt-1 text-xs text-amber-900">
                      Requires ~{utils.format.formatNearAmount(vaultMinDeposit)} NEAR storage deposit
                    </div>
                  )}
                </div>
              ) : ownerRegistered === false ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={onRegisterOwner}
                    disabled={regPending || !ownerMinDeposit}
                    className="inline-flex items-center gap-2 px-3 h-8 rounded border bg-surface disabled:opacity-50"
                  >
                    {regPending ? "Registering…" : "Register your account with token"}
                  </button>
                  {regError && <div className="mt-1 text-xs text-red-700">{regError}</div>}
                </div>
              ) : (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={onTopUp}
                    disabled={transferPending || ownerBalLoading || !ownerHasEnough}
                    className="inline-flex items-center gap-2 px-3 h-8 rounded bg-primary text-primary-text disabled:opacity-50"
                    title={(() => {
                      if (ownerHasEnough) return undefined;
                      return `Need ${missingLabel} ${symbol}, have ${ownerBalanceLabel} ${symbol}`;
                    })()}
                  >
                    {transferPending ? "Transferring…" : `Top up ${missingLabel} ${symbol} to vault`}
                  </button>
                  {transferError && <div className="mt-1 text-xs text-red-700">{transferError}</div>}
                </div>
              )}
            </div>
          )}
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}
