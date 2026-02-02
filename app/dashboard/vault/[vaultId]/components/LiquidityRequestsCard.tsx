"use client";

import React, { useMemo, useState } from "react";
import { useVault } from "@/hooks/useVault";
import { useViewerRole } from "@/hooks/useViewerRole";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { formatMinimalTokenAmount } from "@/utils/format";
import type { Network } from "@/utils/networks";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { utils } from "near-api-js";
import { SECONDS_PER_DAY, AVERAGE_EPOCH_SECONDS } from "@/utils/constants";
import { formatDateTime } from "@/utils/datetime";

import { useAcceptLiquidityRequest } from "@/hooks/useAcceptLiquidityRequest";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useCancelLiquidityRequest } from "@/hooks/useCancelLiquidityRequest";
import { useFtBalance } from "@/hooks/useFtBalance";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useFtStorage } from "@/hooks/useFtStorage";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { tsToDate } from "@/utils/firestoreTimestamps";
import { formatDurationShort } from "@/utils/time";
import { sumMinimal } from "@/utils/amounts";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { useProcessClaims } from "@/hooks/useProcessClaims";
import { showToast } from "@/utils/toast";
import { STRINGS } from "@/utils/strings";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Card } from "@/app/components/ui/Card";
import { VaultUsdcRegisteredNotice } from "./VaultUsdcRegisteredNotice";
import { OwnerVaultRegistrationCard } from "./OwnerVaultRegistrationCard";
import { LiquidityRequestHeader } from "./LiquidityRequestHeader";
import { LiquidityRequestContent, type LiquidityRequestContentData } from "./LiquidityRequestContent";
import { LiquidationStatusSection } from "./LiquidationStatusSection";
import { LiquidityRequestDialogs } from "./LiquidityRequestDialogs";
import {
  computeRemainingYocto,
  computeMaturedTotals,
  computeUnbondingTotals,
  computeExpectedImmediate,
  computeExpectedNext,
  computeClaimableNow,
} from "@/utils/liquidation";
// Big is not directly used here anymore; conversions are handled by utils/numbers

type Props = {
  vaultId: string;
  factoryId: string;
  onAfterAccept?: () => void;
  onAfterRepay?: () => void;
  onAfterTopUp?: () => void;
  onAfterProcess?: () => void;
};




function formatTokenAmount(minimal: string, tokenId: string, network: Network): string {
  const cfg = getTokenConfigById(tokenId, network);
  const decimals = cfg?.decimals ?? getTokenDecimals(tokenId, network);
  const sym = cfg?.symbol ?? "FT";
  const cleaned = formatMinimalTokenAmount(minimal, decimals);
  return `${cleaned} ${sym}`;
}

// NEAR formatter moved to utils/formatNear

// toYoctoBigInt imported from utils/numbers

// Unbonding progress UI is handled inside UnbondingList for clarity.

export function LiquidityRequestsCard({ vaultId, factoryId, onAfterAccept, onAfterRepay, onAfterTopUp, onAfterProcess }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { data, refetch } = useVault(factoryId, vaultId);
  const { data: delData, refetch: refetchDeleg } = useVaultDelegations(factoryId, vaultId);
  const { balance: availableNear, refetch: refetchAvail } = useAvailableBalance(vaultId);
  const network = networkFromFactoryId(factoryId);
  const { isOwner, role } = useViewerRole(factoryId, vaultId);
  const { acceptLiquidity, pending, error: acceptError } = useAcceptLiquidityRequest();
  const { cancelLiquidityRequest, pending: cancelPending, error: cancelError } = useCancelLiquidityRequest();
  const { indexVault } = useIndexVault();
  const usdcId = useMemo(() => getDefaultUsdcTokenId(network), [network]);
  const { storageBalanceOf, storageBounds, registerStorage, pending: storagePending, error: storageError } = useFtStorage();
  const [vaultUsdcRegistered, setVaultUsdcRegistered] = React.useState<boolean | null>(null);
  const { signedAccountId } = useWalletSelector();
  const [lenderRegistered, setLenderRegistered] = React.useState<boolean | null>(null);
  const [lenderMinDeposit, setLenderMinDeposit] = React.useState<string | null>(null);
  const [vaultRegisteredForToken, setVaultRegisteredForToken] = React.useState<boolean | null>(null);
  const [ownerMinDeposit, setOwnerMinDeposit] = React.useState<string | null>(null);

  const content = useMemo<LiquidityRequestContentData | null>(() => {
    const req = data?.liquidity_request;
    if (!req) return null;
    const amount = formatTokenAmount(req.amount, req.token, network);
    const interest = formatTokenAmount(req.interest, req.token, network);
    const collateral = `${utils.format.formatNearAmount(req.collateral)} NEAR`;
    const durationDays = Math.max(1, Math.round((req.duration ?? 0) / SECONDS_PER_DAY));
    const totalDue = formatTokenAmount(sumMinimal(req.amount, req.interest), req.token, network);
    return { amount, interest, collateral, durationDays, token: req.token, amountRaw: req.amount, interestRaw: req.interest, totalDue };
  }, [data, network]);

  // Lender balance check for the token of the current request
  const { balance: lenderTokenBal, loading: balLoading } = useFtBalance(content?.token);
  const sufficientBalance = useMemo(() => {
    try {
      if (!content?.amountRaw || !lenderTokenBal) return false;
      return BigInt(lenderTokenBal) >= BigInt(content.amountRaw);
    } catch {
      return false;
    }
  }, [content?.amountRaw, lenderTokenBal]);
  const tokenDecimals = useMemo(() => (content?.token ? getTokenDecimals(content.token, network) : 6), [content?.token, network]);
  const tokenSymbol = useMemo(() => getTokenConfigById(content?.token ?? "", network)?.symbol ?? "FT", [content?.token, network]);
  const lenderBalanceLabel = useMemo(() => {
    if (!lenderTokenBal) return "—";
    return formatMinimalTokenAmount(lenderTokenBal, tokenDecimals);
  }, [lenderTokenBal, tokenDecimals]);
  const lenderMinDepositLabel = useMemo(
    () => (lenderMinDeposit ? utils.format.formatNearAmount(lenderMinDeposit) : null),
    [lenderMinDeposit]
  );

  // Expiry countdown for active loans
  const acceptedAtDate = useMemo(() => tsToDate(data?.accepted_offer?.accepted_at as unknown), [data?.accepted_offer?.accepted_at]);

  const expiryDate = useMemo(() => {
    if (!acceptedAtDate || !data?.liquidity_request?.duration) return null;
    const ms = acceptedAtDate.getTime() + Number(data.liquidity_request.duration) * 1000;
    return new Date(ms);
  }, [acceptedAtDate, data?.liquidity_request?.duration]);

  const [remainingMs, setRemainingMs] = React.useState<number | null>(null);
  const prevRemainingRef = React.useRef<number | null>(null);
  const [postExpiryOpen, setPostExpiryOpen] = React.useState(false);
  const [postExpiryShown, setPostExpiryShown] = React.useState(false);
  const [ownerPostExpiryOpen, setOwnerPostExpiryOpen] = React.useState(false);
  const [ownerPostExpiryShown, setOwnerPostExpiryShown] = React.useState(false);
  React.useEffect(() => {
    if (!expiryDate) { setRemainingMs(null); return; }
    const tick = () => {
      setRemainingMs((prev) => {
        const next = Math.max(0, expiryDate.getTime() - Date.now());
        prevRemainingRef.current = prev ?? next;
        return next;
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiryDate]);

  // Open lender popup once when the timer reaches zero
  React.useEffect(() => {
    if (
      role === "activeLender" &&
      data?.state === "active" &&
      !data?.liquidation &&
      remainingMs === 0 &&
      !postExpiryShown
    ) {
      const prev = prevRemainingRef.current;
      if (prev === null || prev > 0) {
        setPostExpiryOpen(true);
        setPostExpiryShown(true);
      }
    }
  }, [remainingMs, role, data?.state, data?.liquidation, postExpiryShown]);

  // Open owner popup once when the timer reaches zero
  React.useEffect(() => {
    if (
      isOwner &&
      data?.state === "active" &&
      !data?.liquidation &&
      remainingMs === 0 &&
      !ownerPostExpiryShown
    ) {
      const prev = prevRemainingRef.current;
      if (prev === null || prev > 0) {
        setOwnerPostExpiryOpen(true);
        setOwnerPostExpiryShown(true);
      }
    }
  }, [remainingMs, isOwner, data?.state, data?.liquidation, ownerPostExpiryShown]);

  // Process claims (lender or owner)
  const { processClaims, pending: processPending, error: processError } = useProcessClaims();
  const { indexVault: indexAfterProcess } = useIndexVault();
  const lenderId = data?.accepted_offer?.lender;
  const onBeginLiquidation = async () => {
    try {
      const { txHash } = await processClaims({ vault: vaultId });
      showToast(STRINGS.processClaimsSuccess, { variant: "success" });
      setPostExpiryOpen(false);
      // Update local views immediately
      refetchAvail();
      refetch();
      refetchDeleg();
      onAfterProcess?.();
      // Kick off indexing; refetch again when done
      void indexAfterProcess({ factoryId, vault: vaultId, txHash })
        .then(() => {
          refetchAvail();
          refetch();
          refetchDeleg();
          onAfterProcess?.();
        })
        .catch((e) => {
          console.error("Indexing after process_claims failed", e);
        });
    } catch {
      // handled via processError
    }
  };

  // Placeholders moved below after hasClaimableNow is computed

  const formattedCountdown = useMemo(() => {
    if (remainingMs === null) return null;
    return formatDurationShort(remainingMs);
  }, [remainingMs]);

  const expiryLabel = useMemo(() => (expiryDate ? formatDateTime(expiryDate) : null), [expiryDate]);
  const ownerLiquidationSummary = useMemo(
    () => STRINGS.liquidationOwnerSummary(expiryLabel ?? undefined),
    [expiryLabel]
  );

  // Collateral/liquidation calculations (all in NEAR)
  const collateralYocto = data?.liquidity_request?.collateral;
  const liquidatedYocto = data?.liquidation?.liquidated;
  const collateralLabel = useMemo(() => (collateralYocto ? safeFormatYoctoNear(collateralYocto, 5) : null), [collateralYocto]);
  const remainingYocto = useMemo(
    () => computeRemainingYocto(collateralYocto, liquidatedYocto),
    [collateralYocto, liquidatedYocto]
  );
  const remainingTargetLabel = useMemo(
    () => (remainingYocto === null ? null : safeFormatYoctoNear(remainingYocto.toString(), 5)),
    [remainingYocto]
  );

  const { maturedYocto, maturedTotalLabel } = useMemo(
    () => computeMaturedTotals(delData?.summary),
    [delData?.summary]
  );
  const { unbondingYocto, unbondingTotalLabel, unbondingEntries, longestRemainingEpochs } = useMemo(
    () => computeUnbondingTotals(delData?.summary, delData?.current_epoch ?? null),
    [delData?.summary, delData?.current_epoch]
  );
  const { yocto: expectedImmediateYocto, label: expectedImmediateLabel } = useMemo(
    () => computeExpectedImmediate(availableNear?.minimal, remainingYocto),
    [availableNear?.minimal, remainingYocto]
  );
  const { label: expectedNextLabel } = useMemo(
    () => computeExpectedNext(availableNear?.minimal, remainingYocto, maturedYocto, unbondingYocto),
    [availableNear?.minimal, remainingYocto, maturedYocto, unbondingYocto]
  );
  const { yocto: claimableNowYocto, label: claimableNowLabel } = useMemo(
    () => computeClaimableNow(expectedImmediateYocto, maturedYocto, remainingYocto),
    [expectedImmediateYocto, maturedYocto, remainingYocto]
  );
  const hasClaimableNow = useMemo(() => claimableNowYocto > BigInt(0), [claimableNowYocto]);
  const closesRepay = true;
  const willBePartial = !hasClaimableNow || (Array.isArray(data?.unstake_entries) && data.unstake_entries.length > 0);

  // longestRemainingEpochs is provided by computeUnbondingTotals
  const longestEtaMs = useMemo(() => (longestRemainingEpochs === null ? null : longestRemainingEpochs * AVERAGE_EPOCH_SECONDS * 1000), [longestRemainingEpochs]);
  const longestEtaLabel = useMemo(() => (longestEtaMs && longestEtaMs > 0 ? formatDurationShort(longestEtaMs) : null), [longestEtaMs]);

  const openDisabled = Boolean(
    data?.state === "pending" || data?.state === "active" || !isOwner
  );
  const hasOpenRequest = Boolean(content);

  // Check lender registration on current token
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!signedAccountId || !content?.token) { setLenderRegistered(null); setLenderMinDeposit(null); return; }
      const bal = await storageBalanceOf(content.token, signedAccountId);
      if (cancelled) return;
      const isReg = bal !== null;
      setLenderRegistered(isReg);
      if (!isReg) {
        const bounds = await storageBounds(content.token);
        if (cancelled) return;
        setLenderMinDeposit(bounds?.min ?? null);
      } else {
        setLenderMinDeposit(null);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [signedAccountId, content?.token, storageBalanceOf, storageBounds]);

  const onRegisterLender = async () => {
    if (!signedAccountId || !content?.token || !lenderMinDeposit) return;
    try {
      await registerStorage(content.token, signedAccountId, lenderMinDeposit);
      const bal = await storageBalanceOf(content.token, signedAccountId);
      setLenderRegistered(bal !== null);
    } catch {
      // handled by storageError state
    }
  };

  // Check vault registration for the request token (guards older open requests)
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!content?.token) { setVaultRegisteredForToken(null); return; }
      const bal = await storageBalanceOf(content.token, vaultId);
      if (cancelled) return;
      setVaultRegisteredForToken(bal !== null);
    }
    void run();
    return () => { cancelled = true; };
  }, [content?.token, storageBalanceOf, vaultId]);

  // When owner has an open request but vault isn't registered for that token, compute min deposit
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!isOwner || !hasOpenRequest || vaultRegisteredForToken !== false || !content?.token) {
        setOwnerMinDeposit(null);
        return;
      }
      const bounds = await storageBounds(content.token);
      if (cancelled) return;
      setOwnerMinDeposit(bounds?.min ?? null);
    }
    void run();
    return () => { cancelled = true; };
  }, [isOwner, hasOpenRequest, vaultRegisteredForToken, content?.token, storageBounds]);

  const onRegisterVaultForToken = async () => {
    if (!content?.token || !ownerMinDeposit) return;
    try {
      await registerStorage(content.token, vaultId, ownerMinDeposit);
      const bal = await storageBalanceOf(content.token, vaultId);
      setVaultRegisteredForToken(bal !== null);
    } catch {
      // storageError handled by hook state
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!isOwner || hasOpenRequest) { setVaultUsdcRegistered(null); return; }
      if (!usdcId) { setVaultUsdcRegistered(null); return; }
      const bal = await storageBalanceOf(usdcId, vaultId);
      if (cancelled) return;
      setVaultUsdcRegistered(bal !== null);
    }
    void run();
    return () => { cancelled = true; };
  }, [isOwner, hasOpenRequest, storageBalanceOf, usdcId, vaultId]);

  const onCancel = async () => {
    try {
      const { txHash } = await cancelLiquidityRequest({ vault: vaultId });
      await indexVault({ factoryId, vault: vaultId, txHash });
      refetch();
      refetchAvail();
      showToast("Request cancelled", { variant: "success" });
    } catch (error) {
      console.error("Error cancelling liquidity request:", error);
    }
  };

  const onAccept = async () => {
    if (!data?.liquidity_request) return;
    try {
      const { token, amount, interest, collateral, duration } = data.liquidity_request;
      const { txHash } = await acceptLiquidity({
        vault: vaultId,
        token,
        amount,
        interest,
        collateral,
        duration,
      });
      // Kick off indexing to reflect accepted_offer
      await indexVault({ factoryId, vault: vaultId, txHash });
      // Allow parent to update balances
      onAfterAccept?.();
      setAcceptOpen(false);
    } catch {
      // handled by hook state
    }
  };

  return (
    <Card
      className="space-y-6 rounded-2xl border border-white/10 bg-surface px-4 py-5 sm:px-6 sm:py-6"
      aria-label="Liquidity requests"
    >
      <LiquidityRequestHeader
        hasOpenRequest={hasOpenRequest}
        isOwner={isOwner}
        state={data?.state}
        role={role}
        lenderId={data?.accepted_offer?.lender}
        openDisabled={openDisabled}
        onOpenRequest={() => setOpenDialog(true)}
      />

      {!hasOpenRequest && isOwner && vaultUsdcRegistered !== null && (
        <VaultUsdcRegisteredNotice registered={vaultUsdcRegistered} />
      )}

      {content && (
        <LiquidityRequestContent
          content={content}
          state={data?.state}
          role={role}
          isOwner={isOwner}
          liquidationActive={Boolean(data?.liquidation)}
          expiryDate={expiryDate}
          remainingMs={remainingMs}
          formattedCountdown={formattedCountdown}
          expiryLabel={expiryLabel}
          hasClaimableNow={hasClaimableNow}
          claimableNowLabel={claimableNowLabel}
          expectedNextLabel={expectedNextLabel}
          lenderId={lenderId}
          network={network}
          processError={processError}
          processPending={processPending}
          maturedYocto={maturedYocto}
          onOpenProcess={() => setPostExpiryOpen(true)}
          onRepay={() => setRepayOpen(true)}
          onCancel={onCancel}
          cancelPending={cancelPending}
          cancelError={cancelError}
          tokenSymbol={tokenSymbol}
          lenderBalanceLabel={lenderBalanceLabel}
          lenderRegistered={lenderRegistered}
          lenderMinDepositLabel={lenderMinDepositLabel}
          storagePending={storagePending}
          storageError={storageError}
          onRegisterLender={onRegisterLender}
          vaultRegisteredForToken={vaultRegisteredForToken}
          pending={pending}
          balLoading={balLoading}
          sufficientBalance={sufficientBalance}
          tokenDecimals={tokenDecimals}
          acceptError={acceptError}
          onOpenAccept={() => setAcceptOpen(true)}
          vaultId={vaultId}
        />
      )}

      {/* Liquidation progress/status section */}
      {data?.state === "active" && data?.liquidation && (
        <LiquidationStatusSection
          role={role}
          isOwner={isOwner}
          expiryDate={expiryDate}
          ownerLiquidationSummary={ownerLiquidationSummary}
          liquidatedYocto={data.liquidation.liquidated}
          remainingTargetLabel={remainingTargetLabel}
          collateralLabel={collateralLabel}
          claimableNowLabel={claimableNowLabel}
          hasClaimableNow={hasClaimableNow}
          expectedImmediateYocto={expectedImmediateYocto}
          maturedYocto={maturedYocto}
          maturedTotalLabel={maturedTotalLabel}
          processPending={processPending}
          processError={processError}
          onProcess={() => setPostExpiryOpen(true)}
          unbondingTotalLabel={unbondingTotalLabel}
          unbondingEntries={unbondingEntries}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((v) => !v)}
          longestEtaLabel={longestEtaLabel}
        />
      )}

      {isOwner && hasOpenRequest && vaultRegisteredForToken === false && (
        <OwnerVaultRegistrationCard
          ownerMinDeposit={ownerMinDeposit ? utils.format.formatNearAmount(ownerMinDeposit) : null}
          storagePending={storagePending}
          onRegister={onRegisterVaultForToken}
          tokenId={content?.token}
          network={network}
          storageError={storageError}
        />
      )}
      <LiquidityRequestDialogs
        isOwner={isOwner}
        role={role}
        state={data?.state}
        vaultId={vaultId}
        factoryId={factoryId}
        network={network}
        content={content}
        liquidityRequest={data?.liquidity_request ?? null}
        openDialog={openDialog}
        onCloseOpenDialog={() => setOpenDialog(false)}
        acceptOpen={acceptOpen}
        onCloseAccept={() => setAcceptOpen(false)}
        onConfirmAccept={onAccept}
        acceptPending={pending}
        acceptError={acceptError}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
        postExpiryOpen={postExpiryOpen}
        onClosePostExpiry={() => setPostExpiryOpen(false)}
        onBeginLiquidation={onBeginLiquidation}
        processPending={processPending}
        processError={processError}
        lenderId={lenderId}
        expectedImmediateLabel={expectedImmediateLabel}
        maturedTotalLabel={maturedTotalLabel}
        expectedNextLabel={expectedNextLabel}
        closesRepay={closesRepay}
        willBePartial={willBePartial}
        canProcessNow={hasClaimableNow}
        inProgress={Boolean(data?.liquidation)}
        showLenderGratitude={role === "activeLender"}
        ownerPostExpiryOpen={ownerPostExpiryOpen}
        onCloseOwnerPostExpiry={() => setOwnerPostExpiryOpen(false)}
        onOwnerRepay={() => {
          setOwnerPostExpiryOpen(false);
          setRepayOpen(true);
        }}
        repayOpen={repayOpen}
        onCloseRepay={() => setRepayOpen(false)}
        onRepaySuccess={() => {
          onAfterRepay?.();
          refetchAvail();
          refetch();
          setRepayOpen(false);
        }}
        onVaultTokenBalanceChange={() => {
          onAfterTopUp?.();
        }}
      />
    </Card>
  );
}
