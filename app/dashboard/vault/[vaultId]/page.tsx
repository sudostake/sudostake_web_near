"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Container } from "@/app/components/layout/Container";
import { Button } from "@/app/components/ui/Button";
import { DepositDialog } from "@/app/components/dialogs/DepositDialog";
import { DelegateDialog } from "@/app/components/dialogs/DelegateDialog";
import { RequestLiquidityDialog } from "@/app/components/dialogs/RequestLiquidityDialog";
import { WithdrawDialog } from "@/app/components/dialogs/WithdrawDialog";
import { UndelegateDialog } from "@/app/components/dialogs/UndelegateDialog";
import { CurrentRequestPanel } from "./components/CurrentRequestPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useCancelLiquidityRequest } from "@/hooks/useCancelLiquidityRequest";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { callViewFunction } from "@/utils/api/rpcClient";
import { formatMinimalTokenAmount } from "@/utils/format";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { NATIVE_DECIMALS, NATIVE_TOKEN, SECONDS_PER_DAY } from "@/utils/constants";
import { getDefaultUsdcTokenId, getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { showToast } from "@/utils/toast";
import type { VaultViewState } from "@/utils/types/vault_view_state";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Balance } from "@/utils/balance";
import { DelegationsSummary } from "./components/DelegationsSummary";
import { DelegationsActionsProvider } from "./components/DelegationsActionsContext";
import { sumMinimal } from "@/utils/amounts";
import { STRINGS } from "@/utils/strings";

type LiquidityRequestState = {
  token: string;
  amount: string;
  interest: string;
  collateral: string;
  duration: number;
} | null;

function SummaryField({
  label,
  value,
  title,
  className = "",
}: {
  label: string;
  value: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{label}</div>
      <p className="break-all font-mono text-lg text-foreground" title={title ?? value}>
        {value}
      </p>
    </div>
  );
}

function FlatSection({
  eyebrow,
  title,
  caption,
  actions,
  children,
}: React.PropsWithChildren<{
  eyebrow: string;
  title: string;
  caption?: string;
  actions?: React.ReactNode;
}>) {
  return (
    <section className="space-y-4 border-t border-foreground/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{eyebrow}</div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {caption && <p className="max-w-3xl text-sm text-secondary-text">{caption}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>();
  const vaultId = React.useMemo(() => {
    const raw = params?.vaultId;
    return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  }, [params]);
  const [owner, setOwner] = React.useState<string>("");
  const [ownerLoading, setOwnerLoading] = React.useState(false);
  const [availableNearRaw, setAvailableNearRaw] = React.useState("0");
  const [availableNearBalance, setAvailableNearBalance] = React.useState<string>("");
  const [availableNearLoading, setAvailableNearLoading] = React.useState(false);
  const [availableUsdcBalance, setAvailableUsdcBalance] = React.useState<string>("");
  const [availableUsdcLoading, setAvailableUsdcLoading] = React.useState(false);
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [delegateOpen, setDelegateOpen] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);
  const [undelegateOpen, setUndelegateOpen] = React.useState(false);
  const [undelegateValidator, setUndelegateValidator] = React.useState("");
  const [withdrawAsset, setWithdrawAsset] = React.useState<"NEAR" | "USDC">("NEAR");
  const [connectingWallet, setConnectingWallet] = React.useState(false);
  const [balanceVersion, setBalanceVersion] = React.useState(0);
  const [vaultVersion, setVaultVersion] = React.useState(0);
  const [vaultState, setVaultState] = React.useState<"idle" | "pending" | "active">("idle");
  const [liquidityRequest, setLiquidityRequest] = React.useState<LiquidityRequestState>(null);
  const [requestToken, setRequestToken] = React.useState<string | null>(null);
  const [liquidationActive, setLiquidationActive] = React.useState(false);
  const [refundCount, setRefundCount] = React.useState(0);
  const [factoryId, setFactoryId] = React.useState<string>(() => getActiveFactoryId());
  const { signedAccountId, signIn } = useWalletSelector();
  const { cancelLiquidityRequest, pending: cancelPending, error: cancelError } = useCancelLiquidityRequest();
  const { indexVault } = useIndexVault();
  const { balance: nearBalance, loading: nearBalanceLoading, refetch: refetchNearBalance } = useAccountBalance(vaultId);
  const {
    data: delegationData,
    loading: delegationsLoading,
    error: delegationsError,
    refetch: refetchDelegations,
  } = useVaultDelegations(factoryId, vaultId);
  const availableNearBalanceValue = React.useMemo(
    () => new Balance(availableNearRaw || "0", NATIVE_DECIMALS, NATIVE_TOKEN),
    [availableNearRaw]
  );
  const delegationEntries = delegationData?.summary ?? [];
  const undelegateBalance = React.useMemo(
    () =>
      delegationEntries.find((entry) => entry.validator === undelegateValidator)?.staked_balance ??
      new Balance("0", NATIVE_DECIMALS, NATIVE_TOKEN),
    [delegationEntries, undelegateValidator]
  );
  const delegatedNearRaw = React.useMemo(() => {
    let total = BigInt(0);
    for (const entry of delegationEntries) {
      total += BigInt(entry.staked_balance.minimal);
    }
    return total.toString();
  }, [delegationEntries]);
  const delegatedNearBalance = React.useMemo(
    () => formatMinimalTokenAmount(delegatedNearRaw, NATIVE_DECIMALS),
    [delegatedNearRaw]
  );
  const liquidityRequestContent = React.useMemo(() => {
    if (!liquidityRequest) return null;
    const network = getActiveNetwork();
    const tokenConfig = getTokenConfigById(liquidityRequest.token, network);
    const tokenDecimals = getTokenDecimals(liquidityRequest.token, network);
    const tokenLabel = tokenConfig?.symbol ?? liquidityRequest.token;
    const formatTokenAmount = (amount: string) =>
      `${formatMinimalTokenAmount(amount, tokenDecimals)} ${tokenLabel}`;

    return {
      token: tokenLabel,
      amount: formatTokenAmount(liquidityRequest.amount),
      interest: formatTokenAmount(liquidityRequest.interest),
      totalDue: formatTokenAmount(sumMinimal(liquidityRequest.amount, liquidityRequest.interest)),
      collateral: `${formatMinimalTokenAmount(liquidityRequest.collateral, NATIVE_DECIMALS)} ${NATIVE_TOKEN}`,
      durationDays: Math.max(1, Math.round(liquidityRequest.duration / SECONDS_PER_DAY)),
    };
  }, [liquidityRequest]);

  React.useEffect(() => {
    setFactoryId(getActiveFactoryId());
  }, []);

  React.useEffect(() => {
    if (!vaultId) {
      setOwner("");
      setOwnerLoading(false);
      setVaultState("idle");
      setLiquidityRequest(null);
      setRequestToken(null);
      setLiquidationActive(false);
      return;
    }

    let cancelled = false;
    setOwnerLoading(true);

    callViewFunction<VaultViewState>(vaultId, "get_vault_state", {}, { network: getActiveNetwork() })
      .then((state) => {
        if (cancelled) return;
        setOwner(typeof state?.owner === "string" ? state.owner : "");
        setVaultState(state?.accepted_offer ? "active" : state?.liquidity_request ? "pending" : "idle");
        setLiquidationActive(Boolean(state?.liquidation));
        const request =
          state?.liquidity_request &&
          typeof state.liquidity_request === "object" &&
          typeof state.liquidity_request.token === "string" &&
          typeof state.liquidity_request.amount === "string" &&
          typeof state.liquidity_request.interest === "string" &&
          typeof state.liquidity_request.collateral === "string" &&
          typeof state.liquidity_request.duration === "number"
            ? {
                token: state.liquidity_request.token,
                amount: state.liquidity_request.amount,
                interest: state.liquidity_request.interest,
                collateral: state.liquidity_request.collateral,
                duration: state.liquidity_request.duration,
              }
            : null;
        setLiquidityRequest(request);
        const token = request?.token ?? null;
        setRequestToken(token);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load vault owner", error);
        setOwner("");
        setVaultState("idle");
        setLiquidityRequest(null);
        setRequestToken(null);
        setLiquidationActive(false);
      })
      .finally(() => {
        if (cancelled) return;
        setOwnerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vaultId, vaultVersion]);

  React.useEffect(() => {
    if (!vaultId) {
      setRefundCount(0);
      return;
    }

    let cancelled = false;

    callViewFunction<unknown[]>(vaultId, "get_refund_entries", { account_id: null }, { network: getActiveNetwork() })
      .then((entries) => {
        if (cancelled) return;
        setRefundCount(Array.isArray(entries) ? entries.length : 0);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load vault refund entries", error);
        setRefundCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [vaultId]);

  React.useEffect(() => {
    if (!vaultId) {
      setAvailableNearRaw("0");
      setAvailableNearBalance("");
      setAvailableNearLoading(false);
      return;
    }

    let cancelled = false;
    setAvailableNearLoading(true);

    callViewFunction<string>(vaultId, "view_available_balance", {}, { network: getActiveNetwork() })
      .then((balance) => {
        if (cancelled) return;
        const raw = typeof balance === "string" ? balance : String(balance ?? "0");
        setAvailableNearRaw(raw);
        setAvailableNearBalance(formatMinimalTokenAmount(raw, NATIVE_DECIMALS));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load vault available balance", error);
        setAvailableNearRaw("0");
        setAvailableNearBalance("");
      })
      .finally(() => {
        if (cancelled) return;
        setAvailableNearLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vaultId, balanceVersion]);

  React.useEffect(() => {
    if (!vaultId) {
      setAvailableUsdcBalance("");
      setAvailableUsdcLoading(false);
      return;
    }

    const network = getActiveNetwork();
    const usdcTokenId = getDefaultUsdcTokenId(network);
    if (!usdcTokenId) {
      setAvailableUsdcBalance("");
      setAvailableUsdcLoading(false);
      return;
    }

    let cancelled = false;
    setAvailableUsdcLoading(true);

    callViewFunction<string>(usdcTokenId, "ft_balance_of", { account_id: vaultId }, { network })
      .then((balance) => {
        if (cancelled) return;
        const raw = typeof balance === "string" ? balance : String(balance ?? "0");
        setAvailableUsdcBalance(formatMinimalTokenAmount(raw, getTokenDecimals(usdcTokenId, network)));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load vault USDC balance", error);
        setAvailableUsdcBalance("");
      })
      .finally(() => {
        if (cancelled) return;
        setAvailableUsdcLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vaultId, balanceVersion]);

  const handleDepositSuccess = React.useCallback(() => {
    refetchNearBalance();
    setBalanceVersion((current) => current + 1);
  }, [refetchNearBalance]);

  const connectWallet = React.useCallback(() => {
    if (connectingWallet) return;
    setConnectingWallet(true);
    Promise.resolve(signIn())
      .catch((error) => {
        console.error("Wallet sign-in failed", error);
        showToast("Wallet connection failed. Please try again.", { variant: "error" });
      })
      .finally(() => {
        setConnectingWallet(false);
      });
  }, [connectingWallet, signIn]);

  const handleDepositClick = React.useCallback(() => {
    if (!vaultId) return;
    if (signedAccountId) {
      setDepositOpen(true);
      return;
    }
    connectWallet();
  }, [connectWallet, signedAccountId, vaultId]);

  const handleWithdrawSuccess = React.useCallback(() => {
    refetchNearBalance();
    setBalanceVersion((current) => current + 1);
  }, [refetchNearBalance]);

  const handleRequestLiquiditySuccess = React.useCallback(() => {
    setVaultVersion((current) => current + 1);
  }, []);

  const handleDelegateSuccess = React.useCallback(() => {
    refetchNearBalance();
    refetchDelegations();
    setBalanceVersion((current) => current + 1);
  }, [refetchDelegations, refetchNearBalance]);

  const handleUndelegateSuccess = React.useCallback(() => {
    refetchDelegations();
    setVaultVersion((current) => current + 1);
  }, [refetchDelegations]);

  const viewerMode = !signedAccountId
    ? "guest"
    : ownerLoading
      ? "checkingOwner"
      : owner && signedAccountId === owner
        ? "owner"
        : "lender";
  const isOwnerViewer = viewerMode === "owner";
  const isGuestViewer = viewerMode === "guest";
  const isPublicViewer = viewerMode === "guest" || viewerMode === "lender";
  const publicVaultStatus = liquidationActive
    ? "Liquidation"
    : vaultState === "pending"
      ? "Open request"
      : vaultState === "active"
        ? "Loan active"
        : "No request";
  const publicViewTitle = vaultState === "pending"
    ? "Open request"
    : vaultState === "active"
      ? "Active loan"
      : "Vault snapshot";
  const publicViewBody = vaultState === "pending"
    ? "Public terms and collateral."
    : vaultState === "active"
      ? "Active terms and collateral."
      : "No open request.";
  const pageEyebrow = isPublicViewer ? "Vault view" : "Vault workspace";
  const pageTitle = isPublicViewer ? publicViewTitle : "Vault workspace";
  const pageBody = isPublicViewer
    ? publicViewBody
    : "Manage balances, collateral, and request terms.";
  const requestSectionCaption = liquidityRequestContent
    ? vaultState === "pending"
      ? "Live request terms."
      : "Active loan terms."
    : isPublicViewer
      ? "No open request."
      : "Open a request when ready.";
  const collateralSectionCaption = isPublicViewer
    ? "Validator-backed NEAR."
    : "Validator positions and collateral.";
  const factsSectionCaption = isPublicViewer
    ? "Key vault data."
    : "Balances and identifiers.";
  const delegatedNearLabel = delegationsLoading
    ? "Loading delegated balance..."
    : delegationsError
      ? "Delegated balance unavailable"
      : `${delegatedNearBalance} ${NATIVE_TOKEN}`;
  const validatorsLabel = delegationsLoading
    ? "Loading validators..."
    : delegationsError
      ? "Validator data unavailable"
      : `${delegationEntries.length}`;
  const delegateBlockedReason = liquidationActive
    ? "Delegation is unavailable while liquidation is in progress."
    : refundCount > 0
      ? "Delegation is unavailable while refund entries are pending."
      : null;

  const handleWithdrawClick = React.useCallback((asset: "NEAR" | "USDC") => {
    if (!vaultId) return;
    if (!signedAccountId) {
      connectWallet();
      return;
    }
    if (owner && signedAccountId !== owner) {
      showToast(`Only the vault owner can withdraw ${asset}.`, { variant: "info" });
      return;
    }
    setWithdrawAsset(asset);
    setWithdrawOpen(true);
  }, [connectWallet, owner, signedAccountId, vaultId]);

  const handleDelegateClick = React.useCallback(() => {
    if (!vaultId) return;
    if (delegateBlockedReason) {
      showToast(delegateBlockedReason, { variant: "info" });
      return;
    }
    if (!signedAccountId) {
      connectWallet();
      return;
    }
    if (owner && signedAccountId !== owner) {
      showToast(`Only the vault owner can delegate ${NATIVE_TOKEN}.`, { variant: "info" });
      return;
    }
    setDelegateOpen(true);
  }, [connectWallet, delegateBlockedReason, owner, signedAccountId, vaultId]);

  const handleUndelegateClick = React.useCallback((validator: string) => {
    if (!vaultId) return;
    if (liquidationActive) {
      showToast(STRINGS.undelegateDisabledLiquidation, { variant: "info" });
      return;
    }
    if (vaultState === "pending") {
      showToast(STRINGS.undelegateDisabledPending, { variant: "info" });
      return;
    }
    if (!signedAccountId) {
      connectWallet();
      return;
    }
    if (owner && signedAccountId !== owner) {
      showToast(`Only the vault owner can undelegate ${NATIVE_TOKEN}.`, { variant: "info" });
      return;
    }
    setUndelegateValidator(validator);
    setUndelegateOpen(true);
  }, [connectWallet, liquidationActive, owner, signedAccountId, vaultId, vaultState]);

  const handleOpenRequestClick = React.useCallback(() => {
    if (!vaultId) return;
    if (vaultState !== "idle" || liquidityRequestContent) {
      showToast("This vault already has a liquidity request.", { variant: "info" });
      return;
    }
    if (!signedAccountId) {
      connectWallet();
      return;
    }
    if (owner && signedAccountId !== owner) {
      showToast("Only the vault owner can open a liquidity request.", { variant: "info" });
      return;
    }
    setRequestOpen(true);
  }, [connectWallet, liquidityRequestContent, owner, signedAccountId, vaultId, vaultState]);

  const handleCancelRequest = React.useCallback(async () => {
    if (!vaultId) return;
    if (vaultState !== "pending") {
      showToast("Only pending liquidity requests can be cancelled.", { variant: "info" });
      return;
    }
    if (!signedAccountId) {
      connectWallet();
      return;
    }
    if (owner && signedAccountId !== owner) {
      showToast("Only the vault owner can cancel this liquidity request.", { variant: "info" });
      return;
    }

    try {
      const { txHash } = await cancelLiquidityRequest({ vault: vaultId });
      setVaultState("idle");
      setLiquidityRequest(null);
      setRequestToken(null);
      refetchNearBalance();
      setBalanceVersion((current) => current + 1);
      setVaultVersion((current) => current + 1);
      showToast("Request cancelled", { variant: "success" });
      void indexVault({ factoryId, vault: vaultId, txHash }).catch((error) => {
        console.error("Vault indexing after cancellation failed:", error);
      });
    } catch (error) {
      console.error("Error cancelling liquidity request:", error);
    }
  }, [
    cancelLiquidityRequest,
    connectWallet,
    factoryId,
    indexVault,
    owner,
    refetchNearBalance,
    signedAccountId,
    vaultId,
    vaultState,
  ]);

  return (
    <main id="main" className="min-h-screen bg-background">
      <Container className="space-y-10 pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12">
        <header className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{pageEyebrow}</div>
            <h1 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-foreground">{pageTitle}</h1>
            <p className="max-w-3xl text-sm text-secondary-text">{pageBody}</p>
          </div>

          {isGuestViewer && vaultState === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={connectWallet} disabled={connectingWallet} aria-busy={connectingWallet || undefined}>
                {connectingWallet ? "Opening wallet..." : "Connect wallet"}
              </Button>
            </div>
          )}

          {isOwnerViewer && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDepositClick}
                disabled={!vaultId || connectingWallet}
                aria-busy={connectingWallet || undefined}
              >
                {signedAccountId ? `Deposit ${NATIVE_TOKEN}` : connectingWallet ? "Opening wallet..." : `Connect wallet to deposit ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelegateClick}
                disabled={!vaultId || connectingWallet || ownerLoading || Boolean(delegateBlockedReason)}
                aria-busy={connectingWallet || undefined}
              >
                {delegateBlockedReason
                  ? refundCount > 0
                    ? "Delegation blocked by refunds"
                    : "Delegation blocked by liquidation"
                  : `Delegate ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleWithdrawClick("NEAR")}
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                {`Withdraw ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleWithdrawClick("USDC")}
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                Withdraw USDC
              </Button>
            </div>
          )}
        </header>

        <FlatSection
          eyebrow="Liquidity request"
          title="Current terms"
          caption={requestSectionCaption}
        >
          {liquidityRequestContent ? (
            <div className="space-y-3">
              <CurrentRequestPanel
                content={liquidityRequestContent}
                active={vaultState === "active"}
                flat
              />
              {vaultState === "pending" && isOwnerViewer && (
                <div className="flex flex-col items-start gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => void handleCancelRequest()}
                    disabled={!vaultId || connectingWallet || ownerLoading || cancelPending}
                    aria-busy={cancelPending || undefined}
                  >
                    {cancelPending ? "Cancelling..." : "Cancel request"}
                  </Button>
                  {cancelError && (
                    <p className="text-sm text-secondary-text" role="alert">
                      {cancelError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-secondary-text">
              {isPublicViewer ? "No live liquidity request is open for lenders right now." : "No liquidity request yet."}
            </div>
          )}
          {isOwnerViewer && !liquidityRequestContent && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleOpenRequestClick}
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                Open request
              </Button>
            </div>
          )}
        </FlatSection>

        <FlatSection
          eyebrow={isPublicViewer ? "Collateral" : "Delegations"}
          title={isPublicViewer ? "Validator collateral" : "Validator positions"}
          caption={collateralSectionCaption}
        >
          {delegationsLoading ? (
            <p className="text-sm text-secondary-text">Loading delegations...</p>
          ) : delegationsError ? (
            <p className="text-sm text-secondary-text" title={delegationsError}>
              Delegation summary unavailable.
            </p>
          ) : delegationEntries.length > 0 ? (
            isOwnerViewer ? (
              <DelegationsActionsProvider value={{ onUndelegate: handleUndelegateClick }}>
                <DelegationsSummary entries={delegationEntries} flat />
              </DelegationsActionsProvider>
            ) : (
              <DelegationsSummary entries={delegationEntries} flat />
            )
          ) : (
            <p className="text-sm text-secondary-text">
              {isPublicViewer ? "No validator collateral recorded right now." : "No delegations yet."}
            </p>
          )}
        </FlatSection>

        <FlatSection
          eyebrow="Vault facts"
          title="On-chain snapshot"
          caption={factsSectionCaption}
        >
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryField label="Vault ID" value={vaultId || "Vault address unavailable"} />
            <SummaryField
              label="Owner"
              value={ownerLoading ? "Loading owner..." : owner || "Owner unavailable"}
              title={owner || undefined}
            />
            <SummaryField
              label="Status"
              value={isPublicViewer ? publicVaultStatus : vaultState === "pending" ? "Pending request" : vaultState === "active" ? "Active loan" : "Idle"}
            />
            <SummaryField
              label="Total NEAR balance"
              value={
                nearBalanceLoading
                  ? "Loading balance..."
                  : nearBalance === "—"
                    ? "Balance unavailable"
                    : `${nearBalance} ${NATIVE_TOKEN}`
              }
              title={nearBalance !== "—" ? `${nearBalance} ${NATIVE_TOKEN}` : undefined}
            />
            <SummaryField label="Delegated NEAR" value={delegatedNearLabel} />
            <SummaryField label="Validators" value={validatorsLabel} />
            {!isPublicViewer && (
              <>
                <SummaryField
                  label="Available NEAR balance"
                  value={
                    availableNearLoading
                      ? "Loading available balance..."
                      : availableNearBalance
                        ? `${availableNearBalance} ${NATIVE_TOKEN}`
                        : "Available balance unavailable"
                  }
                  title={availableNearBalance ? `${availableNearBalance} ${NATIVE_TOKEN}` : undefined}
                />
                <SummaryField
                  label="Available USDC balance"
                  value={
                    availableUsdcLoading
                      ? "Loading USDC balance..."
                      : availableUsdcBalance
                        ? `${availableUsdcBalance} USDC`
                        : "USDC balance unavailable"
                  }
                  title={availableUsdcBalance ? `${availableUsdcBalance} USDC` : undefined}
                />
              </>
            )}
          </div>
        </FlatSection>
      </Container>
      <DepositDialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        vaultId={vaultId}
        symbol={NATIVE_TOKEN}
        onSuccess={handleDepositSuccess}
      />
      <RequestLiquidityDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        vaultId={vaultId}
        onSuccess={handleRequestLiquiditySuccess}
      />
      <DelegateDialog
        open={delegateOpen}
        onClose={() => setDelegateOpen(false)}
        vaultId={vaultId}
        balance={availableNearBalanceValue}
        loading={availableNearLoading}
        onSuccess={handleDelegateSuccess}
      />
      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        vaultId={vaultId}
        state={vaultState}
        requestToken={requestToken}
        liquidationActive={liquidationActive}
        refundsCount={refundCount}
        allowedAssets={[withdrawAsset]}
        onSuccess={handleWithdrawSuccess}
      />
      <UndelegateDialog
        open={undelegateOpen}
        onClose={() => setUndelegateOpen(false)}
        vaultId={vaultId}
        validator={undelegateValidator}
        balance={undelegateBalance}
        loading={delegationsLoading}
        onSuccess={handleUndelegateSuccess}
      />
    </main>
  );
}
