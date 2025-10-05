"use client";

import React, { useMemo, useState } from "react";
import { RequestLiquidityDialog } from "@/app/components/dialogs/RequestLiquidityDialog";
import { Modal } from "@/app/components/dialogs/Modal";
import { useVault } from "@/hooks/useVault";
import { useViewerRole } from "@/hooks/useViewerRole";
import { getTokenConfigById, getTokenDecimals } from "@/utils/tokens";
import { formatMinimalTokenAmount } from "@/utils/format";
import type { Network } from "@/utils/networks";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { explorerAccountUrl } from "@/utils/networks";
import { utils } from "near-api-js";
import { toYoctoBigInt } from "@/utils/numbers";
import { SECONDS_PER_DAY, AVERAGE_EPOCH_SECONDS } from "@/utils/constants";
import { formatDateTime } from "@/utils/datetime";
import { STRINGS as STR } from "@/utils/strings";
import { useAcceptLiquidityRequest } from "@/hooks/useAcceptLiquidityRequest";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useCancelLiquidityRequest } from "@/hooks/useCancelLiquidityRequest";
import { useFtBalance } from "@/hooks/useFtBalance";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useFtStorage } from "@/hooks/useFtStorage";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { tsToDate } from "@/utils/firestoreTimestamps";
import { formatDurationShort, formatDays } from "@/utils/time";
import { sumMinimal } from "@/utils/amounts";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { RepayLoanDialog } from "@/app/components/dialogs/RepayLoanDialog";
import { AcceptLiquidityConfirm } from "@/app/components/dialogs/AcceptLiquidityConfirm";
import { PostExpiryLenderDialog } from "@/app/components/dialogs/PostExpiryLenderDialog";
import { PostExpiryOwnerDialog } from "@/app/components/dialogs/PostExpiryOwnerDialog";
import { useProcessClaims } from "@/hooks/useProcessClaims";
import { showToast } from "@/utils/toast";
import { STRINGS, includesMaturedString, fundedByString } from "@/utils/strings";
import { UnbondingList } from "./UnbondingList";
import { LiquidationSummary } from "./LiquidationSummary";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { CurrentRequestPanel } from "./CurrentRequestPanel";
import { LenderActionsPanel } from "./LenderActionsPanel";
import { OwnerActionsPanel } from "./OwnerActionsPanel";
import { VaultUsdcRegisteredNotice } from "./VaultUsdcRegisteredNotice";
import { AcceptActionsPanel } from "./AcceptActionsPanel";
import { OwnerVaultRegistrationCard } from "./OwnerVaultRegistrationCard";
import { PotentialLenderRegistrationCard } from "./PotentialLenderRegistrationCard";
import { Badge } from "@/app/components/ui/Badge";
import { SpinningTokenPair } from "@/app/components/ui/SpinningTokenPair";
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
  const { data, refetch, loading: vaultLoading } = useVault(factoryId, vaultId);
  const { data: delData, refetch: refetchDeleg } = useVaultDelegations(factoryId, vaultId);
  const { balance: availableNear, loading: availLoading, refetch: refetchAvail } = useAvailableBalance(vaultId);
  const network = networkFromFactoryId(factoryId);
  const { isOwner, role } = useViewerRole(factoryId, vaultId);
  const { acceptLiquidity, pending, error: acceptError } = useAcceptLiquidityRequest();
  const { cancelLiquidityRequest, pending: cancelPending, error: cancelError, success: cancelSuccess } = useCancelLiquidityRequest();
  const { indexVault } = useIndexVault();
  const usdcId = useMemo(() => getDefaultUsdcTokenId(network), [network]);
  const { storageBalanceOf, storageBounds, registerStorage, pending: storagePending, error: storageError } = useFtStorage();
  const [vaultUsdcRegistered, setVaultUsdcRegistered] = React.useState<boolean | null>(null);
  const { signedAccountId } = useWalletSelector();
  const [lenderRegistered, setLenderRegistered] = React.useState<boolean | null>(null);
  const [lenderMinDeposit, setLenderMinDeposit] = React.useState<string | null>(null);
  const [vaultRegisteredForToken, setVaultRegisteredForToken] = React.useState<boolean | null>(null);
  const [ownerMinDeposit, setOwnerMinDeposit] = React.useState<string | null>(null);

  const content = useMemo(() => {
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

  // Process claims (lender action)
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

  const { maturedYocto, maturedTotalLabel, maturedEntries } = useMemo(
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
  const { yocto: expectedNextYocto, label: expectedNextLabel } = useMemo(
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
      setVaultUsdcRegistered(!!(bal && typeof bal.total === "string" && bal.total !== "0"));
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
    <section className="rounded border bg-surface p-4" aria-label="Liquidity requests">
      <div className="flex items-center gap-4">
        <SpinningTokenPair pauseOnHover />
        <div className="flex-1 min-w-0">
          {hasOpenRequest ? (
            <>
              <div className="text-base font-medium truncate">
                {isOwner
                  ? data?.state === "active"
                    ? STRINGS.ownerRequestTitleActive
                    : STRINGS.ownerRequestTitlePending
                  : data?.state === "active" && role === "activeLender"
                  ? STRINGS.nonOwnerRequestTitleActiveLender
                  : STRINGS.nonOwnerRequestTitleGeneric}
              </div>
              <div className="mt-1 text-sm text-secondary-text">
                {isOwner
                  ? data?.state === "pending"
                    ? STRINGS.ownerRequestCaptionPending
                    : data?.accepted_offer?.lender
                    ? fundedByString(String(data.accepted_offer.lender))
                    : STRINGS.ownerRequestCaptionFunded
                  : data?.state === "pending"
                  ? STRINGS.nonOwnerRequestCaptionPending
                  : role === "activeLender"
                  ? STRINGS.nonOwnerRequestCaptionActiveLender
                  : STRINGS.nonOwnerRequestCaptionFunded}
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-medium truncate">{STRINGS.accessUsdcTitle}</div>
              <div className="mt-1 text-sm text-secondary-text">{STRINGS.accessUsdcCaption}</div>
            </>
          )}
        </div>
        {!hasOpenRequest && isOwner && (
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => setOpenDialog(true)}
              disabled={openDisabled}
              variant="secondary"
              size="md"
              className="gap-2"
            >
              {STRINGS.openRequest}
            </Button>
          </div>
        )}
      </div>

      {!hasOpenRequest && isOwner && vaultUsdcRegistered !== null && (
        <VaultUsdcRegisteredNotice registered={vaultUsdcRegistered} className="mt-3" />
      )}

      {content && (
        <>
        <CurrentRequestPanel content={content} active={data?.state === "active"} />
        {/* Countdown line removed: the lender action button below now conveys timing */}
          {data?.state === "active" && role === "activeLender" && expiryDate && !data?.liquidation && (
            <LenderActionsPanel
              remainingMs={remainingMs}
              formattedCountdown={formattedCountdown}
              hasClaimableNow={hasClaimableNow}
              claimableNowLabel={claimableNowLabel}
              expectedNextLabel={expectedNextLabel}
              lenderId={lenderId}
              network={network}
              processError={processError}
              processPending={processPending}
              maturedYocto={maturedYocto}
              onOpenProcess={() => setPostExpiryOpen(true)}
            />
          )}
          {/* Intentionally allow repayment post-term:
              We keep the Repay button visible for the owner even after the
              countdown reaches zero (remainingMs === 0), up until liquidation
              actually starts. This matches the banner below which states that
              repayment is still possible until liquidation is triggered. */}
          {data?.state === "active" && isOwner && !data?.liquidation && (
            <OwnerActionsPanel onRepay={() => setRepayOpen(true)} />
          )}
          {/* Accepted timestamp removed for a leaner UI */}
          {data?.state === "active" && remainingMs === 0 && !data?.liquidation && (
            <div className="mt-2 rounded border border-amber-300/40 bg-amber-50 text-amber-900 p-2 text-xs dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-500/30">
              {STRINGS.expiredRepayWarning}
            </div>
          )}
          {/* Lender appreciation card intentionally removed for a leaner UI */}
          {isOwner && data?.state === "pending" ? (
            <div className="mt-3 text-right">
              <Button
                type="button"
                onClick={onCancel}
                disabled={cancelPending}
                variant="secondary"
                size="md"
                className="gap-2"
              >
                {cancelPending ? "Cancelling…" : STRINGS.cancelRequest}
              </Button>
              {cancelError && <div className="mt-2 text-xs text-red-600">{cancelError}</div>}
            </div>
          ) : data?.state === "pending" && role === "potentialLender" ? (
            <div className="mt-3 text-right space-y-2">
              <div className="text-sm text-secondary-text text-left">
                {STRINGS.yourBalance}: <span className="font-mono">{lenderBalanceLabel} {tokenSymbol}</span>
              </div>
              <PotentialLenderRegistrationCard
                network={network}
                tokenId={content?.token}
                lenderRegistered={lenderRegistered}
                lenderMinDeposit={lenderMinDeposit ? utils.format.formatNearAmount(lenderMinDeposit) : null}
                storagePending={storagePending}
                storageError={storageError}
                onRegister={onRegisterLender}
              />
              {vaultRegisteredForToken === false && (
                <div className="text-left text-sm rounded p-2 border border-red-300/40 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100 dark:border-red-500/30">
                  {STRINGS.vaultNotRegisteredLendingDisabled}
                  <div className="mt-1">
                    <a
                      href={explorerAccountUrl(network, vaultId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary underline"
                    >
                      {STRINGS.viewVaultOnExplorer}
                    </a>
                    {content?.token && (
                      <a
                        href={explorerAccountUrl(network, content.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 inline-flex items-center text-primary underline"
                      >
                        {STRINGS.viewTokenOnExplorer}
                      </a>
                    )}
                  </div>
                </div>
              )}
              <AcceptActionsPanel
                pending={pending}
                balLoading={balLoading}
                sufficientBalance={sufficientBalance}
                lenderRegistered={lenderRegistered}
                vaultRegisteredForToken={vaultRegisteredForToken}
                amountRaw={content?.amountRaw}
                tokenDecimals={tokenDecimals}
                tokenSymbol={tokenSymbol}
                lenderBalanceLabel={lenderBalanceLabel}
                acceptError={acceptError}
                onOpen={() => setAcceptOpen(true)}
              />
            </div>
          ) : null}
          {/* Single repay action is shown above in the owner section; avoid duplicating here */}
        </>
      )}

      {/* Liquidation progress/status section */}
      {data?.state === "active" && data?.liquidation && (
        <div className="mt-4 rounded border border-zinc-300/40 bg-zinc-50 text-zinc-900 p-3 dark:border-foreground/20 dark:bg-background/70 dark:text-foreground">
          <div className="flex items-center justify-between gap-2">
            <div className="text-base font-medium">
              {role === "activeLender" ? STRINGS.liquidationInProgress : STRINGS.ownerLiquidationHeader}
            </div>
            <Badge
              variant={role === "activeLender" ? "neutral" : "danger"}
              title={expiryDate ? formatDateTime(expiryDate) : undefined}
            >
              {STRINGS.expiredLabel}
            </Badge>
          </div>
          {role !== "activeLender" && (
            <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
              {STRINGS.loanExpired}
              {expiryDate ? ` on ${formatDateTime(expiryDate)}` : ""}. {STRINGS.liquidationInProgress}
            </div>
          )}
          {role === "activeLender" && (
            <div>
              <LiquidationSummary
                paidSoFarYocto={data.liquidation.liquidated}
                expectedNextLabel={expectedNextLabel ?? expectedImmediateLabel ?? maturedTotalLabel ?? "0"}
                expectedImmediateLabel={expectedImmediateLabel ?? undefined}
                maturedTotalLabel={maturedTotalLabel ?? undefined}
                unbondingTotalLabel={unbondingTotalLabel ?? undefined}
                remainingLabel={remainingTargetLabel ?? undefined}
                showBreakdownHint={showDetails}
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-3 h-9 rounded bg-primary text-primary-text disabled:opacity-60 w-full sm:w-auto"
                  onClick={() => setPostExpiryOpen(true)}
                  disabled={processPending || !hasClaimableNow}
                  title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
                >
                  {processPending ? STRINGS.processing : STRINGS.processAvailableNow}
                </button>
                {processError && (
                  <div className="mt-1 text-xs text-red-600 text-left sm:text-right">{processError}</div>
                )}
              </div>
            </div>
          )}
          {unbondingTotalLabel && role !== "activeLender" && (
            <Card className="mt-2">
              <div className="font-medium">{STRINGS.waitingOnUnbondingTitle}</div>
              <div className="mt-1 text-sm text-secondary-text">
                {STRINGS.ownerWaitingOnUnbondingBody}
              </div>
            </Card>
          )}
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
          {role !== "activeLender" && (
            <LiquidationSummary
              paidSoFarYocto={data.liquidation.liquidated}
              expectedNextLabel={expectedNextLabel ?? expectedImmediateLabel ?? maturedTotalLabel ?? "0"}
              expectedImmediateLabel={expectedImmediateLabel ?? undefined}
              maturedTotalLabel={maturedTotalLabel ?? undefined}
              unbondingTotalLabel={unbondingTotalLabel ?? undefined}
              showPayoutNote={Boolean(lenderId)}
              lenderId={lenderId ?? undefined}
              lenderUrl={lenderId ? explorerAccountUrl(network, lenderId) : undefined}
              showBreakdownHint
            />
          )}
            {unbondingTotalLabel && (
              <Card className="p-2">
                <div className="text-secondary-text flex items-center gap-2">
                  <span>{STRINGS.waitingToUnlock}</span>
                  {unbondingEntries && unbondingEntries.length > 0 && (
                    <Badge variant="neutral">{unbondingEntries.length} {unbondingEntries.length === 1 ? "validator" : "validators"}</Badge>
                  )}
                </div>
                <div className="font-medium">{unbondingTotalLabel} NEAR</div>
                {longestEtaLabel && (
                  <div className="text-xs text-secondary-text mt-0.5">up to ~{longestEtaLabel}</div>
                )}
                {Array.isArray(data?.unstake_entries) && data.unstake_entries.length > 0 && (
                  <div className="mt-1">
                    <button
                      type="button"
                      className="text-xs underline text-primary"
                      onClick={() => setShowDetails((v) => !v)}
                    >
                      {showDetails ? STRINGS.hideDetails : STRINGS.showDetails}
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>
          {role !== "activeLender" && (remainingTargetLabel || collateralLabel) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {remainingTargetLabel && (
                <div>
                  <div className="text-secondary-text">Remaining</div>
                  <div className="font-medium">{remainingTargetLabel} NEAR</div>
                </div>
              )}
              {collateralLabel && (
                <div>
                  <div className="text-secondary-text">Target</div>
                  <div className="font-medium">{collateralLabel} NEAR</div>
                </div>
              )}
            </div>
          )}
          {role !== "activeLender" && lenderId && (
            <div className="mt-1 text-xs text-secondary-text">
              {STRINGS.payoutsGoTo} <span className="font-medium break-all" title={lenderId}>{lenderId}</span>
              <a
                href={explorerAccountUrl(network, lenderId)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline text-primary"
              >
                {STRINGS.viewAccountOnExplorer}
              </a>
            </div>
          )}
          {/* Details toggle moved near the "Waiting to unlock" section */}
          {unbondingTotalLabel && unbondingEntries.length > 0 && (
            <div className={showDetails ? "" : " hidden"}>
              <UnbondingList entries={unbondingEntries} />
              <div className="mt-2 text-xs text-secondary-text">
                {role === "activeLender" ? STRINGS.unbondingFootnoteLender : STRINGS.unbondingFootnoteOwner}
              </div>
            </div>
          )}
          {role !== "activeLender" && (
          <Card className={`mt-3 ${showDetails ? "" : " hidden"}`}>
            <div className="font-medium">{STRINGS.nextPayoutSources}</div>
            <div className="mt-2 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-secondary-text">{STRINGS.availableNow}</div>
                <div className="font-medium">{claimableNowLabel} NEAR</div>
              </div>
              <div className="h-px bg-foreground/10" />
              <div className="flex items-center justify-between">
                <div className="text-secondary-text">{STRINGS.sourceVaultBalanceNow}</div>
                <div className="font-medium">{safeFormatYoctoNear(expectedImmediateYocto.toString())} NEAR</div>
              </div>
              <div className="mt-1">
                <div className="text-secondary-text flex items-center gap-2">
                  <span>{STRINGS.maturedClaimableNow}</span>
                  {maturedEntries.length > 0 && (
                    <Badge variant="neutral">{maturedEntries.length} {maturedEntries.length === 1 ? "validator" : "validators"}</Badge>
                  )}
                </div>
                {maturedEntries.length > 0 ? (
                  <ul className="mt-1 text-sm space-y-1">
                    {maturedEntries.map((m, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="truncate" title={m.validator}>{m.validator}</span>
                        <span className="font-mono">{safeFormatYoctoNear(m.amount)} NEAR</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-secondary-text">{STRINGS.noMaturedYet}</div>
                )}
              </div>
            </div>
          </Card>
          )}
          {role !== "activeLender" && isOwner ? (
            <div className="mt-2 text-xs text-secondary-text">{STRINGS.ownerLiquidationNote}</div>
          ) : null}
        </div>
      )}

      {/* Repay dialog consolidated below */}

      {/* Post-expiry lender popup is rendered below with tighter guards to ensure required data is present */}

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

      
      {isOwner && (
        <RequestLiquidityDialog open={openDialog} onClose={() => setOpenDialog(false)} vaultId={vaultId} />
      )}

      {/* Lender confirmation dialog */}
      {acceptOpen && content && data?.liquidity_request && (
        <AcceptLiquidityConfirm
          open={acceptOpen}
          onClose={() => setAcceptOpen(false)}
          onConfirm={onAccept}
          pending={pending}
          error={acceptError ?? undefined}
          vaultId={vaultId}
          tokenId={content.token}
          tokenSymbol={tokenSymbol}
          decimals={tokenDecimals}
          amountRaw={data.liquidity_request.amount}
          interestRaw={data.liquidity_request.interest}
          collateralYocto={data.liquidity_request.collateral}
          durationSeconds={data.liquidity_request.duration}
        />
      )}

      {/* Post-expiry lender popup */}
      {postExpiryOpen && role === "activeLender" && data?.state === "active" && content && data?.liquidity_request && (
        <PostExpiryLenderDialog
          open={postExpiryOpen}
          onClose={() => setPostExpiryOpen(false)}
          onBegin={onBeginLiquidation}
          vaultId={vaultId}
          tokenSymbol={tokenSymbol}
          totalDueLabel={formatMinimalTokenAmount(sumMinimal(content.amountRaw, content.interestRaw), tokenDecimals)}
          collateralNearLabel={utils.format.formatNearAmount(data.liquidity_request.collateral)}
          pending={processPending}
          error={processError ?? undefined}
          payoutTo={lenderId ?? undefined}
          payoutToUrl={lenderId ? explorerAccountUrl(network, lenderId) : undefined}
          expectedImmediateLabel={expectedImmediateLabel ?? undefined}
          maturedTotalLabel={maturedTotalLabel ?? undefined}
          expectedNextLabel={expectedNextLabel ?? undefined}
          closesRepay={closesRepay}
          willBePartial={willBePartial}
          canProcessNow={hasClaimableNow}
          inProgress={Boolean(data?.liquidation)}
        />
      )}
      {/* Post-expiry owner popup */}
      {ownerPostExpiryOpen && isOwner && data?.state === "active" && content && data?.liquidity_request && (
        <PostExpiryOwnerDialog
          open={ownerPostExpiryOpen}
          onClose={() => setOwnerPostExpiryOpen(false)}
          onRepay={() => {
            setOwnerPostExpiryOpen(false);
            setRepayOpen(true);
          }}
          vaultId={vaultId}
          tokenSymbol={tokenSymbol}
          totalDueLabel={formatMinimalTokenAmount(sumMinimal(content.amountRaw, content.interestRaw), tokenDecimals)}
          collateralNearLabel={utils.format.formatNearAmount(data.liquidity_request.collateral)}
        />
      )}

      {/* Repay dialog for owner */}
      {repayOpen && isOwner && data?.liquidity_request && (
        <RepayLoanDialog
          open={repayOpen}
          onClose={() => setRepayOpen(false)}
          vaultId={vaultId}
          factoryId={factoryId}
          tokenId={data.liquidity_request.token}
          principalMinimal={data.liquidity_request.amount}
          interestMinimal={data.liquidity_request.interest}
          onSuccess={() => {
            onAfterRepay?.();
            refetchAvail();
            refetch();
            setRepayOpen(false);
          }}
          onVaultTokenBalanceChange={() => {
            onAfterTopUp?.();
          }}
        />
      )}
    </section>
  );
}
