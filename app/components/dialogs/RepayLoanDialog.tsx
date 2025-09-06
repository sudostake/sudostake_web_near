"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
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
import { useTokenRegistration } from "@/hooks/useTokenRegistration";
import { explorerAccountUrl } from "@/utils/networks";
import { STRINGS } from "@/utils/strings";
import { sumMinimal } from "@/utils/amounts";

const TOP_UP_MEMO = "Vault top-up for loan repayment";
const COPY_FEEDBACK_MS = 1600;

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

  const totalDueMinimal = useMemo(
    () => sumMinimal(principalMinimal, interestMinimal),
    [principalMinimal, interestMinimal]
  );

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
    } catch (error) {
      // Log details for troubleshooting unexpected parsing issues
      console.error("Error calculating missingMinimal in RepayLoanDialog:", error, {
        vaultTokenBalMinimal: vaultTokenBal?.minimal,
        totalDueMinimal,
      });
      return "0";
    }
  }, [vaultTokenBal?.minimal, totalDueMinimal]);

  const missingLabel = formatMinimalTokenAmount(missingMinimal, decimals);

  const { repayLoan, pending, error } = useRepayLoan();
  const { indexVault } = useIndexVault();
  const { signedAccountId } = useWalletSelector();
  const { registerStorage, pending: regPending, error: regError } = useFtStorage();
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

  const topUpTooltip = useMemo(() => {
    if (ownerHasEnough) return undefined;
    return `Need ${missingLabel} ${symbol}, have ${ownerBalanceLabel} ${symbol}`;
  }, [ownerHasEnough, missingLabel, ownerBalanceLabel, symbol]);

  const { registered: ownerRegistered, minDeposit: ownerMinDeposit, refresh: refreshOwnerReg } = useTokenRegistration(tokenId, signedAccountId);
  const { registered: vaultRegistered, minDeposit: vaultMinDeposit, refresh: refreshVaultReg } = useTokenRegistration(tokenId, vaultId);

  const confirm = async () => {
    try {
      const { txHash } = await repayLoan({ vault: vaultId });
      // Post-tx side effects: run concurrently and don't block success UX
      const results = await Promise.allSettled([
        indexVault({ factoryId, vault: vaultId, txHash }),
        refetchVaultTokenBal(),
      ]);
      const [idxRes, balRes] = results;
      if (idxRes.status === "rejected") {
        console.error("Indexing enqueue failed after repay", idxRes.reason);
      }
      if (balRes.status === "rejected") {
        console.error("Vault token balance refresh failed after repay", balRes.reason);
      }
      showToast(STRINGS.repaySuccess, { variant: "success" });
      onSuccess?.();
      onClose();
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  const onRegisterOwner = async () => {
    if (!signedAccountId || !ownerMinDeposit) return;
    try {
      await registerStorage(tokenId, signedAccountId, ownerMinDeposit);
      refreshOwnerReg();
      showToast(STRINGS.accountRegisteredSuccess, { variant: "success" });
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
      refreshVaultReg();
      showToast(STRINGS.vaultRegisteredSuccess, { variant: "success" });
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
            <TopUpSection
              networkId={network}
              tokenId={tokenId}
              vaultId={vaultId}
              symbol={symbol}
              missingLabel={missingLabel}
              ownerBalLoading={ownerBalLoading}
              ownerBalanceLabel={ownerBalanceLabel}
              vaultRegistered={vaultRegistered}
              ownerRegistered={ownerRegistered}
              regPending={regPending}
              ownerMinDeposit={ownerMinDeposit}
              vaultMinDeposit={vaultMinDeposit}
              regError={regError}
              transferPending={transferPending}
              transferError={transferError}
              ownerHasEnough={ownerHasEnough}
              topUpTooltip={topUpTooltip}
              onRegisterOwner={onRegisterOwner}
              onRegisterVault={onRegisterVault}
              onTopUp={onTopUp}
            />
          )}
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}

type TopUpSectionProps = {
  networkId: ReturnType<typeof networkFromFactoryId>;
  tokenId: string;
  vaultId: string;
  symbol: string;
  missingLabel: string;
  ownerBalLoading: boolean;
  ownerBalanceLabel: string;
  vaultRegistered: boolean | null;
  ownerRegistered: boolean | null;
  regPending: boolean;
  ownerMinDeposit: string | null;
  vaultMinDeposit: string | null;
  regError: string | null;
  transferPending: boolean;
  transferError: string | null;
  ownerHasEnough: boolean;
  topUpTooltip?: string;
  onRegisterOwner: () => Promise<void> | void;
  onRegisterVault: () => Promise<void> | void;
  onTopUp: () => Promise<void> | void;
};

function TopUpSection({
  networkId,
  tokenId,
  vaultId,
  symbol,
  missingLabel,
  ownerBalLoading,
  ownerBalanceLabel,
  vaultRegistered,
  ownerRegistered,
  regPending,
  ownerMinDeposit,
  vaultMinDeposit,
  regError,
  transferPending,
  transferError,
  ownerHasEnough,
  topUpTooltip,
  onRegisterOwner,
  onRegisterVault,
  onTopUp,
}: TopUpSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      showToast(STRINGS.copied, { variant: "success", duration: COPY_FEEDBACK_MS });
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(
        () => setCopied((prev) => (prev === text ? null : prev)),
        COPY_FEEDBACK_MS
      );
    } catch (e) {
      showToast(getFriendlyErrorMessage(e), { variant: "error" });
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);
  return (
    <div className="mt-2 rounded border border-amber-500/30 bg-amber-100/50 text-amber-900 p-2">
      <div>Missing {missingLabel} {symbol} on the vault to complete repayment.</div>
      <div className="mt-1 text-secondary-text">
        Your balance: <span className="font-medium text-foreground">{ownerBalLoading ? "…" : `${ownerBalanceLabel} ${symbol}`}</span>
      </div>
      <div className="mt-1 text-xs text-secondary-text">
        <a
          href={explorerAccountUrl(networkId, tokenId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          {STRINGS.viewTokenOnExplorer}
        </a>
        <button
          type="button"
          className="ml-2 underline text-primary"
          onClick={() => copy(tokenId)}
          title={copied === tokenId ? STRINGS.copied : STRINGS.copy}
        >
          {copied === tokenId ? STRINGS.copied : STRINGS.copy}
        </button>
        <a
          href={explorerAccountUrl(networkId, vaultId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary ml-3"
        >
          {STRINGS.viewVaultOnExplorer}
        </a>
        <button
          type="button"
          className="ml-2 underline text-primary"
          onClick={() => copy(vaultId)}
          title={copied === vaultId ? STRINGS.copied : STRINGS.copy}
        >
          {copied === vaultId ? STRINGS.copied : STRINGS.copy}
        </button>
      </div>
      {vaultRegistered === false ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={onRegisterVault}
            disabled={regPending || !vaultMinDeposit}
            className="inline-flex items-center gap-2 px-3 h-8 rounded bg-primary text-primary-text disabled:opacity-50"
          >
            {regPending ? "Registering…" : STRINGS.registerVaultWithToken}
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
            {regPending ? "Registering…" : STRINGS.registerAccountWithToken}
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
            title={topUpTooltip}
          >
            {transferPending ? STRINGS.transferring : STRINGS.topUpToVault(missingLabel, symbol)}
          </button>
          {transferError && <div className="mt-1 text-xs text-red-700">{transferError}</div>}
        </div>
      )}
    </div>
  );
}
