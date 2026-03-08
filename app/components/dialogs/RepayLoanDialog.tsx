"use client";

import { useMemo } from "react";
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
import { STRINGS } from "@/utils/strings";
import { sumMinimal } from "@/utils/amounts";
import { Button } from "@/app/components/ui/Button";

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

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 px-4 py-3 ${
        emphasized ? "bg-[color:var(--surface-muted)]" : ""
      }`}
    >
      <div className="text-sm text-secondary-text">{label}</div>
      <div
        className={`text-right ${
          emphasized ? "text-base font-semibold text-foreground" : "text-sm font-medium text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

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

  const {
    registered: ownerRegistered,
    minDeposit: ownerMinDeposit,
    loading: ownerRegistrationLoading,
    refresh: refreshOwnerReg,
  } = useTokenRegistration(tokenId, signedAccountId);
  const {
    registered: vaultRegistered,
    minDeposit: vaultMinDeposit,
    loading: vaultRegistrationLoading,
    refresh: refreshVaultReg,
  } = useTokenRegistration(tokenId, vaultId);

  const vaultBalanceLabel = balLoading ? "Checking…" : `${vaultTokenBal?.toDisplay() ?? "0"} ${symbol}`;
  const canRepayNow = !balLoading && missingMinimal === "0";
  const statusMessage = balLoading
    ? `Checking whether the vault already holds enough ${symbol} to repay this loan.`
    : canRepayNow
      ? `The vault balance covers the full repayment amount. You can repay now.`
      : `Add ${missingLabel} ${symbol} to the vault to enable repayment.`;

  const confirm = async () => {
    try {
      const { txHash } = await repayLoan({ vault: vaultId });
      // Immediately inform user of success and close dialog
      showToast(STRINGS.repaySuccess, { variant: "success" });
      onSuccess?.();
      onClose();

      // Fire-and-forget post-tx side effects: do not block UX
      void Promise.allSettled([
        indexVault({ factoryId, vault: vaultId, txHash }),
        refetchVaultTokenBal(),
      ]).then(([idxRes, balRes]) => {
        if (idxRes.status === "rejected") {
          console.error("Indexing enqueue failed after repay", idxRes.reason);
        }
        if (balRes.status === "rejected") {
          console.error("Vault token balance update failed after repay", balRes.reason);
        }
      }).catch((err) => {
        // Shouldn't happen with allSettled, but guard just in case
        console.error("Unexpected error in post-repay side effects", err);
      });
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
        <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center">
          <Button variant="secondary" onClick={onClose} disabled={pending} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={pending || balLoading || missingMinimal !== "0"}
            title={missingMinimal !== "0" ? `Missing ${missingLabel} ${symbol} on vault` : undefined}
            aria-busy={pending ? true : undefined}
            className="w-full sm:w-auto"
          >
            {pending ? "Repaying…" : "Repay now"}
          </Button>
          {pending && (
            <div className="sr-only" role="status" aria-live="polite">Repaying…</div>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-secondary-text">{statusMessage}</p>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--surface)]">
          <div className="divide-y divide-[color:var(--panel-border)]">
            <SummaryRow label="Principal" value={`${principalLabel} ${symbol}`} />
            <SummaryRow label="Interest" value={`${interestLabel} ${symbol}`} />
            <SummaryRow label="Total due" value={`${totalDueLabel} ${symbol}`} emphasized />
            <SummaryRow label="Vault balance" value={vaultBalanceLabel} />
            {missingMinimal !== "0" && (
              <SummaryRow label="Still needed" value={`${missingLabel} ${symbol}`} />
            )}
          </div>
        </div>

        {missingMinimal !== "0" ? (
          <TopUpSection
            symbol={symbol}
            missingLabel={missingLabel}
            ownerBalLoading={ownerBalLoading}
            ownerBalanceLabel={ownerBalanceLabel}
            vaultRegistered={vaultRegistered}
            ownerRegistered={ownerRegistered}
            vaultRegistrationLoading={vaultRegistrationLoading}
            ownerRegistrationLoading={ownerRegistrationLoading}
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
        ) : null}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

type TopUpSectionProps = {
  symbol: string;
  missingLabel: string;
  ownerBalLoading: boolean;
  ownerBalanceLabel: string;
  vaultRegistered: boolean | null;
  ownerRegistered: boolean | null;
  vaultRegistrationLoading: boolean;
  ownerRegistrationLoading: boolean;
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
  symbol,
  missingLabel,
  ownerBalLoading,
  ownerBalanceLabel,
  vaultRegistered,
  ownerRegistered,
  vaultRegistrationLoading,
  ownerRegistrationLoading,
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
  const registrationLoading = vaultRegistrationLoading || ownerRegistrationLoading;
  const stepTitle = registrationLoading
    ? "Checking token registration"
    : vaultRegistered === false
      ? "Register vault"
      : ownerRegistered === false
        ? "Register wallet"
        : "Top up vault";
  const stepDescription = registrationLoading
    ? "Checking whether the vault and your wallet can receive and send this token."
    : vaultRegistered === false
      ? "The vault must be registered before it can receive the repayment shortfall."
      : ownerRegistered === false
        ? "Your wallet must be registered before you can transfer tokens into the vault."
        : `Transfer ${missingLabel} ${symbol} to the vault, then repay the loan.`;
  const storageDepositLabel = vaultRegistered === false
    ? vaultMinDeposit
      ? `Requires about ${utils.format.formatNearAmount(vaultMinDeposit)} NEAR for one-time storage.`
      : null
    : ownerRegistered === false
      ? ownerMinDeposit
        ? `Requires about ${utils.format.formatNearAmount(ownerMinDeposit)} NEAR for one-time storage.`
        : null
      : null;
  const actionError = vaultRegistered === false || ownerRegistered === false ? regError : transferError;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-4 text-sm text-amber-950 dark:text-amber-100">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-foreground">
          Missing {missingLabel} {symbol} on the vault
        </div>
        <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
          {stepDescription}
        </p>
        <div className="text-sm text-secondary-text">
          Wallet balance: <span className="font-medium text-foreground">{ownerBalLoading ? "Checking…" : `${ownerBalanceLabel} ${symbol}`}</span>
        </div>
        {!ownerBalLoading && !ownerHasEnough && vaultRegistered !== false && ownerRegistered !== false && (
          <div className="text-xs text-amber-900 dark:text-amber-100">
            Your wallet does not currently hold enough {symbol} to cover the shortfall.
          </div>
        )}
        {storageDepositLabel && (
          <div className="text-xs text-amber-900 dark:text-amber-100">{storageDepositLabel}</div>
        )}
        {actionError && <div className="text-xs text-red-700 dark:text-red-300" role="alert">{actionError}</div>}
      </div>

      <div className="mt-3">
        {registrationLoading ? (
          <div className="text-sm text-secondary-text">{stepTitle}…</div>
        ) : vaultRegistered === false ? (
          <Button onClick={onRegisterVault} disabled={regPending || !vaultMinDeposit} aria-busy={regPending ? true : undefined} className="w-full sm:w-auto">
            {regPending ? "Registering…" : STRINGS.registerVaultWithToken}
          </Button>
        ) : ownerRegistered === false ? (
          <Button variant="secondary" onClick={onRegisterOwner} disabled={regPending || !ownerMinDeposit} aria-busy={regPending ? true : undefined} className="w-full sm:w-auto">
            {regPending ? "Registering…" : STRINGS.registerAccountWithToken}
          </Button>
        ) : (
          <Button onClick={onTopUp} disabled={transferPending || ownerBalLoading || !ownerHasEnough} title={topUpTooltip} aria-busy={transferPending ? true : undefined} className="w-full sm:w-auto">
            {transferPending ? STRINGS.transferring : STRINGS.topUpToVault(missingLabel, symbol)}
          </Button>
        )}
        {(regPending || transferPending) && (
          <div className="mt-2 sr-only" role="status" aria-live="polite">
            {regPending ? "Registering…" : STRINGS.transferring}
          </div>
        )}
      </div>
    </div>
  );
}
