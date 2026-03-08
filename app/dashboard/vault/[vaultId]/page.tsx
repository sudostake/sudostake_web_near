"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/app/components/layout/Container";
import { Button } from "@/app/components/ui/Button";
import { AddValueDialog } from "@/app/components/dialogs/AddValueDialog";
import { AcceptLiquidityConfirm } from "@/app/components/dialogs/AcceptLiquidityConfirm";
import { DepositDialog } from "@/app/components/dialogs/DepositDialog";
import { DelegateDialog } from "@/app/components/dialogs/DelegateDialog";
import { RepayLoanDialog } from "@/app/components/dialogs/RepayLoanDialog";
import { RequestLiquidityDialog } from "@/app/components/dialogs/RequestLiquidityDialog";
import { WithdrawDialog } from "@/app/components/dialogs/WithdrawDialog";
import { UndelegateDialog } from "@/app/components/dialogs/UndelegateDialog";
import { CurrentRequestPanel } from "./components/CurrentRequestPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useAcceptLiquidityRequest } from "@/hooks/useAcceptLiquidityRequest";
import { useCancelLiquidityRequest } from "@/hooks/useCancelLiquidityRequest";
import { useFtBalance } from "@/hooks/useFtBalance";
import { useFtStorage } from "@/hooks/useFtStorage";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useProcessClaims } from "@/hooks/useProcessClaims";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import type { ViewerRole } from "@/hooks/useViewerRole";
import { callViewFunction } from "@/utils/api/rpcClient";
import { formatMinimalTokenAmount } from "@/utils/format";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { AVERAGE_EPOCH_SECONDS, NATIVE_DECIMALS, NATIVE_TOKEN, SECONDS_PER_DAY } from "@/utils/constants";
import { getDefaultUsdcTokenId, getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { showToast } from "@/utils/toast";
import type { VaultViewState } from "@/utils/types/vault_view_state";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Balance } from "@/utils/balance";
import { DelegationsSummary } from "./components/DelegationsSummary";
import { DelegationsActionsProvider } from "./components/DelegationsActionsContext";
import { LiquidationStatusSection } from "./components/LiquidationStatusSection";
import { FlatSection } from "@/app/components/ui/FlatSection";
import { sumMinimal } from "@/utils/amounts";
import { formatDateTime } from "@/utils/datetime";
import { normalizeToIntegerString } from "@/utils/numbers";
import { STRINGS } from "@/utils/strings";
import { formatDurationShort } from "@/utils/time";
import {
  computeClaimableNow,
  computeExpectedImmediate,
  computeMaturedTotals,
  computeRemainingYocto,
  computeUnbondingTotals,
} from "@/utils/liquidation";
import { utils } from "near-api-js";
import { APP_ROUTES, sanitizeReturnHref } from "@/app/components/navigationRoutes";

type LiquidityRequestState = {
  token: string;
  amount: string;
  interest: string;
  collateral: string;
  duration: number;
} | null;

type AcceptedOfferState = {
  lender: string;
  acceptedAt: string;
} | null;

type LiquidationState = {
  liquidated: string;
} | null;

function acceptedAtToDate(value: string): Date | null {
  try {
    const ms = BigInt(value) / BigInt(1_000_000);
    return new Date(Number(ms));
  } catch {
    return null;
  }
}

function SummaryField({
  label,
  value,
  title,
  className = "",
  mono = true,
}: {
  label: string;
  value: string;
  title?: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{label}</div>
      <p className={`break-all text-lg text-foreground ${mono ? "font-mono" : "font-medium"}`} title={title ?? value}>
        {value}
      </p>
    </div>
  );
}

function ActionRow({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-secondary-text">{detail}</p>
      </div>
      {action && <div className="sm:flex-none">{action}</div>}
    </div>
  );
}

export default function VaultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ vaultId: string }>();
  const vaultId = React.useMemo(() => {
    const raw = params?.vaultId;
    return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  }, [params]);
  const returnHref = React.useMemo(
    () => sanitizeReturnHref(searchParams.get("from")),
    [searchParams]
  );
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
  const [acceptOpen, setAcceptOpen] = React.useState(false);
  const [addValueOpen, setAddValueOpen] = React.useState(false);
  const [repayOpen, setRepayOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);
  const [undelegateOpen, setUndelegateOpen] = React.useState(false);
  const [undelegateValidator, setUndelegateValidator] = React.useState("");
  const [withdrawAsset, setWithdrawAsset] = React.useState<"NEAR" | "USDC">("NEAR");
  const [connectingWallet, setConnectingWallet] = React.useState(false);
  const [balanceVersion, setBalanceVersion] = React.useState(0);
  const [vaultVersion, setVaultVersion] = React.useState(0);
  const [vaultState, setVaultState] = React.useState<"idle" | "pending" | "active">("idle");
  const [liquidityRequest, setLiquidityRequest] = React.useState<LiquidityRequestState>(null);
  const [acceptedOffer, setAcceptedOffer] = React.useState<AcceptedOfferState>(null);
  const [requestToken, setRequestToken] = React.useState<string | null>(null);
  const [liquidationActive, setLiquidationActive] = React.useState(false);
  const [liquidation, setLiquidation] = React.useState<LiquidationState>(null);
  const [refundCount, setRefundCount] = React.useState(0);
  const [factoryId, setFactoryId] = React.useState<string>(() => getActiveFactoryId());
  const [acceptReadinessVersion, setAcceptReadinessVersion] = React.useState(0);
  const [lenderRegistered, setLenderRegistered] = React.useState<boolean | null>(null);
  const [lenderMinDeposit, setLenderMinDeposit] = React.useState<string | null>(null);
  const [vaultRegisteredForToken, setVaultRegisteredForToken] = React.useState<boolean | null>(null);
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null);
  const [showLiquidationDetails, setShowLiquidationDetails] = React.useState(false);
  const { signedAccountId, signIn } = useWalletSelector();
  const { acceptLiquidity, pending: acceptPending, error: acceptError } = useAcceptLiquidityRequest();
  const { cancelLiquidityRequest, pending: cancelPending, error: cancelError } = useCancelLiquidityRequest();
  const { processClaims, pending: processPending, error: processError } = useProcessClaims();
  const { balance: lenderTokenBalance, loading: lenderTokenBalanceLoading, refetch: refetchLenderTokenBalance } = useFtBalance(liquidityRequest?.token ?? null);
  const { storageBalanceOf, storageBounds, registerStorage, pending: storagePending, error: storageError } = useFtStorage();
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
  const delegationEntries = React.useMemo(
    () => delegationData?.summary ?? [],
    [delegationData?.summary]
  );
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
  const requestTokenDecimals = React.useMemo(() => {
    if (!liquidityRequest?.token) return 6;
    return getTokenDecimals(liquidityRequest.token, getActiveNetwork());
  }, [liquidityRequest?.token]);
  const requestTokenSymbol = React.useMemo(() => {
    if (!liquidityRequest?.token) return "FT";
    return getTokenConfigById(liquidityRequest.token, getActiveNetwork())?.symbol ?? "FT";
  }, [liquidityRequest?.token]);
  const sufficientLenderBalance = React.useMemo(() => {
    try {
      if (!liquidityRequest?.amount || !lenderTokenBalance) return false;
      return BigInt(lenderTokenBalance) >= BigInt(liquidityRequest.amount);
    } catch {
      return false;
    }
  }, [liquidityRequest?.amount, lenderTokenBalance]);
  const lenderBalanceLabel = React.useMemo(() => {
    if (!lenderTokenBalance) return "—";
    return formatMinimalTokenAmount(lenderTokenBalance, requestTokenDecimals);
  }, [lenderTokenBalance, requestTokenDecimals]);
  const lenderMinDepositLabel = React.useMemo(
    () => (lenderMinDeposit ? utils.format.formatNearAmount(lenderMinDeposit) : null),
    [lenderMinDeposit]
  );
  const requestAmountLabel = React.useMemo(() => {
    if (!liquidityRequest?.amount) return `0 ${requestTokenSymbol}`;
    return `${formatMinimalTokenAmount(liquidityRequest.amount, requestTokenDecimals)} ${requestTokenSymbol}`;
  }, [liquidityRequest?.amount, requestTokenDecimals, requestTokenSymbol]);
  const lenderWalletBalanceLabel = React.useMemo(() => {
    if (lenderTokenBalanceLoading) return `Checking ${requestTokenSymbol} balance.`;
    if (!lenderTokenBalance) return `Wallet has 0 ${requestTokenSymbol}.`;
    return `Wallet has ${lenderBalanceLabel} ${requestTokenSymbol}.`;
  }, [lenderBalanceLabel, lenderTokenBalance, lenderTokenBalanceLoading, requestTokenSymbol]);
  const lenderFundingGapLabel = React.useMemo(() => {
    try {
      if (!liquidityRequest?.amount) return null;
      const required = BigInt(liquidityRequest.amount);
      const current = BigInt(lenderTokenBalance ?? "0");
      if (current >= required) return null;
      return `${formatMinimalTokenAmount((required - current).toString(), requestTokenDecimals)} ${requestTokenSymbol}`;
    } catch {
      return requestAmountLabel;
    }
  }, [lenderTokenBalance, liquidityRequest?.amount, requestAmountLabel, requestTokenDecimals, requestTokenSymbol]);
  const requestUsesDefaultUsdc = React.useMemo(() => {
    if (!liquidityRequest?.token) return false;
    return liquidityRequest.token === getDefaultUsdcTokenId(getActiveNetwork());
  }, [liquidityRequest?.token]);
  const addFundsLabel = React.useMemo(
    () => (getActiveNetwork() === "testnet" ? `Get ${requestTokenSymbol}` : `Buy ${requestTokenSymbol}`),
    [requestTokenSymbol]
  );
  const acceptedAtDate = React.useMemo(
    () => (acceptedOffer?.acceptedAt ? acceptedAtToDate(acceptedOffer.acceptedAt) : null),
    [acceptedOffer?.acceptedAt]
  );
  const liquidationStartDate = React.useMemo(() => {
    if (!acceptedAtDate || !liquidityRequest?.duration) return null;
    return new Date(acceptedAtDate.getTime() + liquidityRequest.duration * 1000);
  }, [acceptedAtDate, liquidityRequest?.duration]);
  const formattedCountdown = React.useMemo(
    () => (remainingMs === null ? null : formatDurationShort(remainingMs)),
    [remainingMs]
  );
  const liquidationStartLabel = React.useMemo(
    () => (liquidationStartDate ? formatDateTime(liquidationStartDate) : null),
    [liquidationStartDate]
  );

  React.useEffect(() => {
    setFactoryId(getActiveFactoryId());
  }, []);

  React.useEffect(() => {
    if (!vaultId) {
      setOwner("");
      setOwnerLoading(false);
      setVaultState("idle");
      setLiquidityRequest(null);
      setAcceptedOffer(null);
      setRequestToken(null);
      setLiquidationActive(false);
      setLiquidation(null);
      return;
    }

    let cancelled = false;
    setOwnerLoading(true);

    callViewFunction<VaultViewState>(vaultId, "get_vault_state", {}, { network: getActiveNetwork() })
      .then((state) => {
        if (cancelled) return;
        setOwner(typeof state?.owner === "string" ? state.owner : "");
        setVaultState(state?.accepted_offer ? "active" : state?.liquidity_request ? "pending" : "idle");
        const liquidationState =
          state?.liquidation && typeof state.liquidation === "object"
            ? {
                liquidated:
                  typeof state.liquidation.liquidated === "string" ||
                  typeof state.liquidation.liquidated === "number" ||
                  typeof state.liquidation.liquidated === "bigint"
                    ? normalizeToIntegerString(state.liquidation.liquidated)
                    : "0",
              }
            : null;
        setLiquidationActive(Boolean(state?.liquidation));
        setLiquidation(liquidationState);
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
        const accepted =
          state?.accepted_offer &&
          typeof state.accepted_offer === "object" &&
          typeof state.accepted_offer.lender === "string" &&
          (typeof state.accepted_offer.accepted_at === "string" ||
            typeof state.accepted_offer.accepted_at === "number" ||
            typeof state.accepted_offer.accepted_at === "bigint")
            ? {
                lender: state.accepted_offer.lender,
                acceptedAt: normalizeToIntegerString(state.accepted_offer.accepted_at),
              }
            : null;
        setLiquidityRequest(request);
        setAcceptedOffer(accepted);
        const token = request?.token ?? null;
        setRequestToken(token);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load vault owner", error);
        setOwner("");
        setVaultState("idle");
        setLiquidityRequest(null);
        setAcceptedOffer(null);
        setRequestToken(null);
        setLiquidationActive(false);
        setLiquidation(null);
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
    if (vaultState !== "active" || liquidationActive || !liquidationStartDate) {
      setRemainingMs(null);
      return;
    }

    const tick = () => {
      setRemainingMs(Math.max(0, liquidationStartDate.getTime() - Date.now()));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [liquidationActive, liquidationStartDate, vaultState]);

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

  const handleProcessClaims = React.useCallback(async () => {
    if (!vaultId) return;
    if (!signedAccountId) {
      connectWallet();
      return;
    }

    try {
      const { txHash } = await processClaims({ vault: vaultId });
      showToast(STRINGS.processClaimsSuccess, { variant: "success" });
      refetchNearBalance();
      refetchDelegations();
      setBalanceVersion((current) => current + 1);
      setVaultVersion((current) => current + 1);
      void indexVault({ factoryId, vault: vaultId, txHash })
        .then(() => {
          refetchNearBalance();
          refetchDelegations();
          setBalanceVersion((current) => current + 1);
          setVaultVersion((current) => current + 1);
        })
        .catch((error) => {
          console.error("Vault indexing after process_claims failed:", error);
        });
    } catch (error) {
      console.error("Error processing liquidation claims:", error);
    }
  }, [
    connectWallet,
    factoryId,
    indexVault,
    processClaims,
    refetchDelegations,
    refetchNearBalance,
    signedAccountId,
    vaultId,
  ]);

  const handleRepaySuccess = React.useCallback(() => {
    refetchNearBalance();
    refetchDelegations();
    setBalanceVersion((current) => current + 1);
    setVaultVersion((current) => current + 1);
  }, [refetchDelegations, refetchNearBalance]);

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
  const fallbackBackHref = signedAccountId ? APP_ROUTES.dashboard.href : APP_ROUTES.discover.href;
  const backLabel = React.useMemo(() => {
    if (!returnHref) return "Back";
    if (returnHref === APP_ROUTES.home.href) return "Back home";
    if (returnHref.startsWith(APP_ROUTES.discover.href)) return "Back to discover";
    if (returnHref.startsWith(APP_ROUTES.dashboard.href)) return "Back to dashboard";
    return "Back";
  }, [returnHref]);
  const canAcceptLiquidityRequest =
    viewerMode === "lender" &&
    vaultState === "pending" &&
    Boolean(liquidityRequest);
  const acceptReady =
    canAcceptLiquidityRequest &&
    sufficientLenderBalance &&
    lenderRegistered === true &&
    vaultRegisteredForToken === true;
  const isAcceptedLenderViewer = Boolean(
    signedAccountId &&
    acceptedOffer?.lender &&
    signedAccountId === acceptedOffer.lender
  );
  const liquidationViewerRole = React.useMemo<ViewerRole>(() => {
    if (isAcceptedLenderViewer) return "activeLender";
    if (isOwnerViewer) return "owner";
    if (signedAccountId) return "potentialLender";
    return "guest";
  }, [isAcceptedLenderViewer, isOwnerViewer, signedAccountId]);
  const collateralLabel = React.useMemo(
    () => (liquidityRequest?.collateral ? safeFormatYoctoNear(liquidityRequest.collateral, 5) : null),
    [liquidityRequest?.collateral]
  );
  const remainingYocto = React.useMemo(
    () => computeRemainingYocto(liquidityRequest?.collateral, liquidation?.liquidated),
    [liquidityRequest?.collateral, liquidation?.liquidated]
  );
  const remainingTargetLabel = React.useMemo(
    () => (remainingYocto === null ? null : safeFormatYoctoNear(remainingYocto.toString(), 5)),
    [remainingYocto]
  );
  const { maturedYocto, maturedTotalLabel } = React.useMemo(
    () => computeMaturedTotals(delegationData?.summary),
    [delegationData?.summary]
  );
  const { unbondingTotalLabel, unbondingEntries, longestRemainingEpochs } = React.useMemo(
    () => computeUnbondingTotals(delegationData?.summary, delegationData?.current_epoch ?? null),
    [delegationData?.current_epoch, delegationData?.summary]
  );
  const { yocto: expectedImmediateYocto } = React.useMemo(
    () => computeExpectedImmediate(availableNearRaw, remainingYocto),
    [availableNearRaw, remainingYocto]
  );
  const { yocto: claimableNowYocto, label: claimableNowLabel } = React.useMemo(
    () => computeClaimableNow(expectedImmediateYocto, maturedYocto, remainingYocto),
    [expectedImmediateYocto, maturedYocto, remainingYocto]
  );
  const hasClaimableNow = React.useMemo(() => claimableNowYocto > BigInt(0), [claimableNowYocto]);
  const longestEtaLabel = React.useMemo(() => {
    if (longestRemainingEpochs === null) return null;
    const etaMs = longestRemainingEpochs * AVERAGE_EPOCH_SECONDS * 1000;
    return etaMs > 0 ? formatDurationShort(etaMs) : null;
  }, [longestRemainingEpochs]);
  const showLiquidationProgress = Boolean(
    liquidationActive &&
    liquidation &&
    liquidityRequest &&
    (isAcceptedLenderViewer || isOwnerViewer)
  );
  const checkingAcceptReadiness =
    canAcceptLiquidityRequest &&
    (lenderTokenBalanceLoading || lenderRegistered === null || vaultRegisteredForToken === null);
  const needsFunds = !checkingAcceptReadiness && !sufficientLenderBalance;
  const needsLenderRegistration = !checkingAcceptReadiness && lenderRegistered === false;
  const needsVaultRegistration = !checkingAcceptReadiness && vaultRegisteredForToken === false;
  const publicVaultStatus = liquidationActive
    ? "Liquidation"
    : vaultState === "pending"
      ? "Open request"
      : vaultState === "active"
        ? "Loan active"
        : "No request";
  const publicViewTitle = liquidationActive
    ? "Liquidation in progress"
    : vaultState === "pending"
    ? "Open request"
    : vaultState === "active"
      ? "Active loan"
      : "Vault snapshot";
  const publicViewBody = liquidationActive
    ? isAcceptedLenderViewer
      ? "Track payouts, claimable balance, and unstaking progress."
      : "Liquidation is underway for this vault."
    : vaultState === "pending"
    ? "Public terms and collateral."
    : vaultState === "active"
      ? "Active terms and collateral."
      : "No open request.";
  const pageTitle = isPublicViewer ? publicViewTitle : "Vault workspace";
  const pageBody = isPublicViewer
    ? publicViewBody
    : "Manage balances, collateral, and request terms.";
  const ownerRepayDetail = remainingMs !== null && remainingMs > 0
    ? `Repay before ${liquidationStartLabel ?? "the deadline"} to avoid liquidation.`
    : "Repay now before liquidation begins.";
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
  React.useEffect(() => {
    if (!canAcceptLiquidityRequest) {
      setAcceptOpen(false);
      setLenderRegistered(null);
      setLenderMinDeposit(null);
      return;
    }

    let cancelled = false;

    async function run() {
      if (!signedAccountId || !liquidityRequest?.token) return;
      const balance = await storageBalanceOf(liquidityRequest.token, signedAccountId);
      if (cancelled) return;
      const registered = balance !== null;
      setLenderRegistered(registered);
      if (!registered) {
        const bounds = await storageBounds(liquidityRequest.token);
        if (cancelled) return;
        setLenderMinDeposit(bounds?.min ?? null);
        return;
      }
      setLenderMinDeposit(null);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [acceptReadinessVersion, canAcceptLiquidityRequest, liquidityRequest?.token, signedAccountId, storageBalanceOf, storageBounds]);

  React.useEffect(() => {
    if (vaultState !== "pending" || !liquidityRequest?.token || !vaultId) {
      setVaultRegisteredForToken(null);
      return;
    }

    let cancelled = false;
    const tokenId = liquidityRequest.token;

    async function run() {
      const balance = await storageBalanceOf(tokenId, vaultId);
      if (cancelled) return;
      setVaultRegisteredForToken(balance !== null);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [acceptReadinessVersion, liquidityRequest?.token, storageBalanceOf, vaultId, vaultState]);

  React.useEffect(() => {
    if (!canAcceptLiquidityRequest) return;

    const onFocus = () => {
      void refetchLenderTokenBalance();
      setAcceptReadinessVersion((current) => current + 1);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [canAcceptLiquidityRequest, refetchLenderTokenBalance]);

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

  const handleRegisterLender = React.useCallback(async () => {
    if (!signedAccountId || !liquidityRequest?.token || !lenderMinDeposit) return;

    try {
      await registerStorage(liquidityRequest.token, signedAccountId, lenderMinDeposit);
      const balance = await storageBalanceOf(liquidityRequest.token, signedAccountId);
      const registered = balance !== null;
      setLenderRegistered(registered);
      setLenderMinDeposit(registered ? null : lenderMinDeposit);
      setAcceptReadinessVersion((current) => current + 1);
      if (registered) {
        showToast(STRINGS.accountRegisteredSuccess, { variant: "success" });
      }
    } catch (error) {
      console.error("Error registering lender token storage:", error);
    }
  }, [lenderMinDeposit, liquidityRequest?.token, registerStorage, signedAccountId, storageBalanceOf]);

  const handleAcceptRequest = React.useCallback(async () => {
    if (!vaultId || !liquidityRequest) return;
    if (!signedAccountId) {
      connectWallet();
      return;
    }

    try {
      const { txHash } = await acceptLiquidity({
        vault: vaultId,
        token: liquidityRequest.token,
        amount: liquidityRequest.amount,
        interest: liquidityRequest.interest,
        collateral: liquidityRequest.collateral,
        duration: liquidityRequest.duration,
      });
      setAcceptOpen(false);
      setVaultState("active");
      setAcceptedOffer({
        lender: signedAccountId,
        acceptedAt: (BigInt(Date.now()) * BigInt(1_000_000)).toString(),
      });
      showToast("Request accepted", { variant: "success" });
      void refetchLenderTokenBalance();
      void indexVault({ factoryId, vault: vaultId, txHash })
        .then(() => {
          refetchNearBalance();
          refetchDelegations();
          setVaultVersion((current) => current + 1);
        })
        .catch((error) => {
          console.error("Vault indexing after accept failed:", error);
        });
    } catch (error) {
      console.error("Error accepting liquidity request:", error);
    }
  }, [
    acceptLiquidity,
    connectWallet,
    factoryId,
    indexVault,
    liquidityRequest,
    refetchDelegations,
    refetchLenderTokenBalance,
    refetchNearBalance,
    signedAccountId,
    vaultId,
  ]);

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
  const handleBackClick = React.useCallback(() => {
    if (returnHref) {
      router.replace(returnHref);
      return;
    }

    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) {
          router.back();
          return;
        }
      } catch (error) {
        console.warn("Failed to parse vault referrer.", error);
      }
    }

    router.replace(fallbackBackHref);
  }, [fallbackBackHref, returnHref, router]);

  return (
    <main id="main" className="min-h-screen bg-background">
      <Container className="space-y-10 pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12">
        <header className="space-y-4">
          <div>
            <Button type="button" variant="ghost" size="sm" onClick={handleBackClick} className="gap-2 px-0 text-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span>{backLabel}</span>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-foreground">{pageTitle}</h1>
            <p className="max-w-3xl text-sm text-secondary-text">{pageBody}</p>
          </div>

          {isGuestViewer && vaultState === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={connectWallet} disabled={connectingWallet} aria-busy={connectingWallet || undefined}>
                {connectingWallet ? "Opening wallet..." : "Connect wallet to continue"}
              </Button>
            </div>
          )}

          {isOwnerViewer && (
            <div
              className="grid w-full gap-2 min-[420px]:grid-cols-2 lg:flex lg:flex-wrap"
              role="group"
              aria-label="Vault owner actions"
            >
              <Button
                onClick={handleDepositClick}
                className="w-full min-[420px]:col-span-2 lg:w-auto"
                disabled={!vaultId || connectingWallet}
                aria-busy={connectingWallet || undefined}
              >
                {signedAccountId ? `Deposit ${NATIVE_TOKEN}` : connectingWallet ? "Opening wallet..." : `Connect wallet to deposit ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelegateClick}
                className="w-full lg:w-auto"
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                {`Delegate ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleWithdrawClick("NEAR")}
                className="w-full lg:w-auto"
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                {`Withdraw ${NATIVE_TOKEN}`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleWithdrawClick("USDC")}
                className="w-full min-[420px]:col-span-2 lg:w-auto"
                disabled={!vaultId || connectingWallet || ownerLoading}
                aria-busy={connectingWallet || undefined}
              >
                Withdraw USDC
              </Button>
            </div>
          )}
        </header>

        <FlatSection
          title="Current terms"
        >
          {liquidityRequestContent ? (
            <div className="space-y-3">
              <CurrentRequestPanel
                content={liquidityRequestContent}
                active={vaultState === "active"}
                showTimeline={vaultState === "active" && !liquidationActive && remainingMs !== null}
                countdownLabel={formattedCountdown}
                expired={remainingMs === 0}
                flat
              />
              {vaultState === "active" && isPublicViewer && !liquidationActive && remainingMs !== null && (
                <ActionRow
                  title={isAcceptedLenderViewer ? "What next" : "Loan countdown"}
                  detail={
                    remainingMs > 0
                      ? isAcceptedLenderViewer
                        ? `Liquidation opens in ${formattedCountdown}. If the loan is not repaid, you can begin liquidation after ${liquidationStartLabel}.`
                        : `Liquidation can begin in ${formattedCountdown} if the loan is not repaid. Deadline: ${liquidationStartLabel}.`
                      : isAcceptedLenderViewer
                        ? "Repayment window ended. You can begin liquidation now."
                      : "Repayment window ended. Liquidation can begin now."
                  }
                />
              )}
              {vaultState === "active" && isOwnerViewer && !liquidationActive && liquidityRequest && (
                <ActionRow
                  title="Repay now"
                  detail={ownerRepayDetail}
                  action={
                    <Button
                      type="button"
                      onClick={() => setRepayOpen(true)}
                      variant="primary"
                      size="sm"
                    >
                      {STRINGS.ownerRepayNow}
                    </Button>
                  }
                />
              )}
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
              {isPublicViewer ? "No live liquidity request." : "No liquidity request yet."}
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

        {canAcceptLiquidityRequest && liquidityRequest && (
          <FlatSection
            title="Accept request"
            caption={checkingAcceptReadiness ? "Checking requirements." : undefined}
          >
            <div className="space-y-4">
              {checkingAcceptReadiness && (
                <p className="text-sm text-secondary-text">Checking wallet and token setup.</p>
              )}
              {needsFunds && (
                <ActionRow
                  title={`Get ${lenderFundingGapLabel ?? requestAmountLabel}`}
                  detail={`Need ${requestAmountLabel}. ${lenderWalletBalanceLabel}`}
                  action={
                    requestUsesDefaultUsdc ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setAddValueOpen(true)}
                      >
                        {addFundsLabel}
                      </Button>
                    ) : undefined
                  }
                />
              )}
              {needsLenderRegistration && (
                <ActionRow
                  title="Register account"
                  detail={
                    lenderMinDepositLabel
                      ? `One-time deposit: ${lenderMinDepositLabel} NEAR.`
                      : "One-time token storage deposit."
                  }
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleRegisterLender()}
                      disabled={storagePending || !lenderMinDeposit}
                      aria-busy={storagePending || undefined}
                    >
                      Register account
                    </Button>
                  }
                />
              )}
              {needsVaultRegistration && (
                <ActionRow
                  title="Wait for vault"
                  detail="Owner needs to register token storage."
                />
              )}
              {acceptReady && (
                <ActionRow
                  title="Ready"
                  detail={`Lend ${requestAmountLabel} and confirm in wallet.`}
                  action={
                    <Button
                      type="button"
                      onClick={() => setAcceptOpen(true)}
                      disabled={acceptPending}
                      variant="primary"
                      size="sm"
                      aria-busy={acceptPending || undefined}
                    >
                      {acceptPending ? "Confirming..." : "Accept request"}
                    </Button>
                  }
                />
              )}
              {storageError && lenderRegistered === false && (
                <p className="text-sm text-secondary-text" role="alert">
                  {storageError}
                </p>
              )}
              {acceptError && (
                <p className="text-sm text-secondary-text" role="alert">
                  {acceptError}
                </p>
              )}
            </div>
          </FlatSection>
        )}

        {showLiquidationProgress && (
          <FlatSection
            title="Liquidation in progress"
          >
            <LiquidationStatusSection
              role={liquidationViewerRole}
              expiryDate={liquidationStartDate}
              liquidatedYocto={liquidation?.liquidated ?? "0"}
              remainingTargetLabel={remainingTargetLabel}
              collateralLabel={collateralLabel}
              claimableNowLabel={claimableNowLabel}
              hasClaimableNow={hasClaimableNow}
              expectedImmediateYocto={expectedImmediateYocto}
              maturedYocto={maturedYocto}
              maturedTotalLabel={maturedTotalLabel}
              processPending={processPending}
              processError={processError}
              onProcess={() => void handleProcessClaims()}
              unbondingTotalLabel={unbondingTotalLabel}
              unbondingEntries={unbondingEntries}
              showDetails={showLiquidationDetails}
              onToggleDetails={() => setShowLiquidationDetails((current) => !current)}
              longestEtaLabel={longestEtaLabel}
            />
          </FlatSection>
        )}

        <FlatSection
          title={isPublicViewer ? "Validator collateral" : "Validator positions"}
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
          title="On-chain snapshot"
        >
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryField label="Vault ID" value={vaultId || "Vault address unavailable"} />
            <SummaryField
              label="Owner"
              value={ownerLoading ? "Loading owner..." : owner || "Owner unavailable"}
              title={owner || undefined}
            />
            {vaultState === "active" && acceptedOffer?.lender && (
              <SummaryField
                label="Active lender"
                value={acceptedOffer.lender}
                title={acceptedOffer.lender}
              />
            )}
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
      {liquidityRequest && (
        <RepayLoanDialog
          open={repayOpen}
          onClose={() => setRepayOpen(false)}
          vaultId={vaultId}
          factoryId={factoryId}
          tokenId={liquidityRequest.token}
          principalMinimal={liquidityRequest.amount}
          interestMinimal={liquidityRequest.interest}
          onSuccess={handleRepaySuccess}
          onVaultTokenBalanceChange={() => {
            setBalanceVersion((current) => current + 1);
          }}
        />
      )}
      <AddValueDialog
        open={addValueOpen}
        onClose={() => {
          setAddValueOpen(false);
          void refetchLenderTokenBalance();
          setAcceptReadinessVersion((current) => current + 1);
        }}
      />
      {liquidityRequest && (
        <AcceptLiquidityConfirm
          open={acceptOpen}
          onClose={() => setAcceptOpen(false)}
          onConfirm={() => void handleAcceptRequest()}
          pending={acceptPending}
          error={acceptError}
          vaultId={vaultId}
          tokenSymbol={requestTokenSymbol}
          decimals={requestTokenDecimals}
          amountRaw={liquidityRequest.amount}
          interestRaw={liquidityRequest.interest}
          collateralYocto={liquidityRequest.collateral}
          durationSeconds={liquidityRequest.duration}
        />
      )}
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
