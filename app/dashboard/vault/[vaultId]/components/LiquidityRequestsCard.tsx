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
import { PostExpiryLenderDialog } from "@/app/components/dialogs/PostExpiryLenderDialog";
import { PostExpiryOwnerDialog } from "@/app/components/dialogs/PostExpiryOwnerDialog";
import { useProcessClaims } from "@/hooks/useProcessClaims";
import { showToast } from "@/utils/toast";
import { STRINGS, includesMaturedString } from "@/utils/strings";
import { UnbondingList } from "./UnbondingList";
import { LiquidationSummary } from "./LiquidationSummary";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import {
  computeRemainingYocto,
  computeMaturedTotals,
  computeUnbondingTotals,
  computeExpectedImmediate,
  computeExpectedNext,
  computeClaimableNow,
} from "@/utils/liquidation";
// Big is not directly used here anymore; conversions are handled by utils/numbers

type Props = { vaultId: string; factoryId: string; onAfterAccept?: () => void; onAfterRepay?: () => void; onAfterTopUp?: () => void };




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

export function LiquidityRequestsCard({ vaultId, factoryId, onAfterAccept, onAfterRepay, onAfterTopUp }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { data, refetch, loading: vaultLoading } = useVault(factoryId, vaultId);
  const { data: delData } = useVaultDelegations(factoryId, vaultId);
  const { balance: availableNear, loading: availLoading, refetch: refetchAvail } = useAvailableBalance(vaultId);
  const network = networkFromFactoryId(factoryId);
  const { isOwner, role } = useViewerRole(factoryId, vaultId);
  const { acceptLiquidity, pending, error: acceptError } = useAcceptLiquidityRequest();
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
      // Refresh local views immediately
      refetchAvail();
      refetch();
      // Kick off indexing; refresh again when done
      void indexAfterProcess({ factoryId, vault: vaultId, txHash })
        .then(() => {
          refetchAvail();
          refetch();
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

  // TODO: Implement cancel request mutation (factory/vault contract) in a follow-up PR.
  const onCancel = async () => {
    // Placeholder: intentionally no-op for this release.
    return;
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
      // Allow parent to refresh balances
      onAfterAccept?.();
      setAcceptOpen(false);
    } catch {
      // handled by hook state
    }
  };

  return (
    <section className="rounded border bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="coin-scene">
          <div className="coin" aria-hidden="true">
            <div className="face front" />
            <div className="face back" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {hasOpenRequest ? (
            <>
              <div className="text-base font-medium truncate">
                {isOwner
                  ? data?.state === "active"
                    ? "Your request is funded"
                    : "Your liquidity request"
                  : data?.state === "active" && role === "activeLender"
                  ? "You funded this request"
                  : "Vault liquidity request"}
              </div>
              <div className="mt-1 text-sm text-secondary-text">
                {isOwner
                  ? data?.state === "pending"
                    ? "You can cancel before an offer is accepted."
                    : data?.accepted_offer?.lender
                    ? `Funded by ${data.accepted_offer.lender}`
                    : "This request has been funded."
                  : data?.state === "pending"
                  ? "Review the terms and accept to lend. Your tokens will transfer to the vault via ft_transfer_call."
                  : role === "activeLender"
                  ? "You are the lender for this active request."
                  : "This request has been funded."}
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-medium truncate">Access USDC backed by your staked tokens</div>
              <div className="mt-1 text-sm text-secondary-text">Open a request for USDC using your vault as collateral.</div>
            </>
          )}
        </div>
        {!hasOpenRequest && isOwner && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setOpenDialog(true)}
              disabled={openDisabled}
              className="inline-flex items-center gap-2 px-3 h-9 rounded border bg-surface hover:bg-surface/90 disabled:opacity-50"
            >
              Open request
            </button>
          </div>
        )}
      </div>

      {!hasOpenRequest && isOwner && vaultUsdcRegistered !== null && (
        <div className={`mt-3 rounded border p-3 text-sm ${vaultUsdcRegistered ? "border-emerald-500/30 bg-emerald-100/30 text-emerald-900 dark:text-emerald-100" : "border-amber-500/30 bg-amber-100/40 text-amber-900 dark:text-amber-100"}`}>
          {vaultUsdcRegistered ? (
            <div>Your vault is registered with the default USDC token. You can receive USDC via ft_transfer_call.</div>
          ) : (
            <div>Your vault is not registered with the default USDC token yet. You will be prompted to register during the request flow.</div>
          )}
        </div>
      )}

      {content && (
        <div className="mt-4 rounded border border-foreground/10 p-3 bg-background">
          <div className="text-sm text-secondary-text">Current request</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-secondary-text">Token</div>
              <div className="font-medium truncate" title={content.token}>{content.token}</div>
            </div>
            <div>
              <div className="text-secondary-text">Amount</div>
              <div className="font-medium">{content.amount}</div>
            </div>
            <div>
              <div className="text-secondary-text">Interest</div>
              <div className="font-medium">{content.interest}</div>
            </div>
            {data?.state === "active" && (
              <div>
                <div className="text-secondary-text">Total due</div>
                <div className="font-medium">{content.totalDue}</div>
              </div>
            )}
            <div>
              <div className="text-secondary-text">Collateral</div>
              <div className="font-medium">{content.collateral}</div>
            </div>
            <div>
              <div className="text-secondary-text">Duration</div>
              <div className="font-medium">{formatDays(content.durationDays)}</div>
            </div>
          </div>
          {/* Countdown line removed: the lender action button below now conveys timing */}
          {data?.state === "active" && role === "activeLender" && expiryDate && !data?.liquidation && (
            <div className="mt-2 text-sm">
              {remainingMs !== null && remainingMs > 0 ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-3 h-10 rounded bg-primary text-primary-text disabled:opacity-50 w-full sm:w-auto"
                  title="Available after expiry"
                  disabled
                  aria-disabled={true}
                >
                  {`Start liquidation in ${formattedCountdown ?? "—"}`}
                </button>
              ) : (
                <div className="rounded border border-foreground/10 bg-background p-3">
                  <div className="text-sm font-medium mb-2">{STRINGS.nextPayoutSources}</div>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-secondary-text">{STRINGS.availableNow}</div>
                      <div className="font-medium">{claimableNowLabel} NEAR</div>
                    </div>
                    {!hasClaimableNow && (
                      <div className="text-xs text-secondary-text">
                        {STRINGS.nothingAvailableNow}
                        {expectedNextLabel && (
                          <>
                            {" · "}{STRINGS.expectedNext}: {expectedNextLabel} NEAR
                          </>
                        )}
                      </div>
                    )}
                    {lenderId && (
                      <div className="text-xs text-secondary-text">
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
                    {/* Simplified: detailed sources are covered by the Waiting to unlock section */}
                    {processError && (
                      <div className="text-xs text-red-600">{processError}</div>
                    )}
                    {maturedYocto > BigInt(0) && (
                      <div className="text-xs text-secondary-text">
                        {includesMaturedString(safeFormatYoctoNear(maturedYocto.toString(), 5))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-3 h-9 rounded bg-primary text-primary-text disabled:opacity-60 w-full sm:w-auto"
                      onClick={() => setPostExpiryOpen(true)}
                      disabled={processPending || !hasClaimableNow}
                      title={!hasClaimableNow ? STRINGS.nothingAvailableNow : undefined}
                    >
                      {processPending ? STRINGS.processing : STRINGS.processAvailableNow}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {data?.state === "active" && isOwner && !data?.liquidation && remainingMs !== 0 && (
            <div className="mt-2 text-sm">
              <button
                type="button"
                onClick={() => setRepayOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-3 h-10 rounded bg-primary text-primary-text disabled:opacity-50 w-full sm:w-auto"
              >
                Repay now
              </button>
            </div>
          )}
          {/* Accepted timestamp removed for a leaner UI */}
          {data?.state === "active" && remainingMs === 0 && !data?.liquidation && (
            <div className="mt-2 rounded border border-foreground/20 bg-background/80 text-foreground p-2 text-xs dark:bg-background/60">
              The loan duration has ended. Repayment is still possible until liquidation is triggered.
            </div>
          )}
          {/* Lender appreciation card intentionally removed for a leaner UI */}
          {isOwner && data?.state === "pending" ? (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={onCancel}
                disabled={true}
                title="Cancel will be available in the next update"
                className="inline-flex items-center gap-2 px-3 h-9 rounded border bg-surface disabled:opacity-50"
              >
                Cancel request (soon)
              </button>
            </div>
          ) : data?.state === "pending" && role === "potentialLender" ? (
            <div className="mt-3 text-right space-y-2">
              <div className="text-sm text-secondary-text text-left">
                Your balance: <span className="font-medium">{lenderBalanceLabel} {tokenSymbol}</span>
              </div>
              {lenderRegistered === false && (
                <div className="text-left text-sm text-amber-800 bg-amber-100/60 border border-amber-500/30 rounded p-2">
                  Your account is not registered with this token contract. You must register before accepting.
                  {lenderMinDeposit && (
                    <>
                      {" "}Registration requires ~{utils.format.formatNearAmount(lenderMinDeposit)} NEAR.
                    </>
                  )}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={onRegisterLender}
                      disabled={storagePending || !lenderMinDeposit}
                      className="inline-flex items-center gap-2 px-3 h-8 rounded border bg-surface disabled:opacity-50"
                    >
                      {storagePending ? "Registering…" : "Register with token"}
                    </button>
                    {content?.token && (
                      <a
                        href={explorerAccountUrl(network, content.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 inline-flex items-center text-primary underline"
                      >
                        View token on Explorer
                      </a>
                    )}
                    <a
                      href="/docs/token-registration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 inline-flex items-center text-primary underline"
                    >
                      Learn more
                    </a>
                    {storageError && <div className="mt-1 text-xs text-red-600 dark:text-red-300">{storageError}</div>}
                  </div>
                </div>
              )}
              {vaultRegisteredForToken === false && (
                <div className="text-left text-sm rounded p-2 border border-red-300/40 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100 dark:border-red-500/30">
                  This vault is not registered with this token contract yet. Lending is disabled until the vault owner registers the vault with this token.
                  <div className="mt-1">
                    <a
                      href={explorerAccountUrl(network, vaultId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary underline"
                    >
                      View vault on Explorer
                    </a>
                    {content?.token && (
                      <a
                        href={explorerAccountUrl(network, content.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 inline-flex items-center text-primary underline"
                      >
                        View token on Explorer
                      </a>
                    )}
                  </div>
                </div>
              )}
              {acceptError && (
                <div className="text-sm text-red-500" role="alert">{acceptError}</div>
              )}
              <button
                type="button"
                onClick={() => setAcceptOpen(true)}
                disabled={
                  pending ||
                  balLoading ||
                  !sufficientBalance ||
                  lenderRegistered === false ||
                  vaultRegisteredForToken === false
                }
                title={
                  pending ? undefined : balLoading ? undefined : !sufficientBalance && content?.amountRaw
                    ? `Need ${formatMinimalTokenAmount(content.amountRaw, tokenDecimals)} ${tokenSymbol}, have ${lenderBalanceLabel} ${tokenSymbol}`
                    : lenderRegistered === false
                    ? "You must register with the token contract before accepting"
                    : vaultRegisteredForToken === false
                    ? "Vault must be registered with the token contract before lending can proceed"
                    : undefined
                }
                className="inline-flex items-center gap-2 px-3 h-9 rounded bg-primary text-primary-text disabled:opacity-50"
              >
                {pending
                  ? "Accepting…"
                  : balLoading
                  ? "Checking balance…"
                  : lenderRegistered === false
                  ? "Registration required"
                  : vaultRegisteredForToken === false
                  ? "Vault not registered"
                  : sufficientBalance
                  ? "Accept request"
                  : "Insufficient balance"}
              </button>
            </div>
          ) : null}
          {/* Single repay action is shown above in the owner section; avoid duplicating here */}
        </div>
      )}

      {/* Liquidation progress/status section */}
      {data?.state === "active" && data?.liquidation && (
        <div className="mt-4 rounded border border-zinc-300/40 bg-zinc-50 text-zinc-900 p-3 dark:border-foreground/20 dark:bg-background/70 dark:text-foreground">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium">{role === "activeLender" ? STRINGS.gettingYourMoney : STRINGS.ownerLiquidationHeader}</div>
            <Badge variant={role === "activeLender" ? "warn" : "danger"} title={expiryDate ? formatDateTime(expiryDate) : undefined}>Expired</Badge>
          </div>
          <div className={`mt-1 text-xs ${role === "activeLender" ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-700 dark:text-zinc-300"}`}>
            {STR.loanExpired}{expiryDate ? ` on ${formatDateTime(expiryDate)}` : ""}. {STR.liquidationInProgress}
          </div>
          {role === "activeLender" && (
            <div>
              <LiquidationSummary
                paidSoFarYocto={data.liquidation.liquidated}
                expectedNextLabel={expectedNextLabel ?? expectedImmediateLabel ?? maturedTotalLabel ?? "0"}
                expectedImmediateLabel={expectedImmediateLabel ?? undefined}
                maturedTotalLabel={maturedTotalLabel ?? undefined}
                unbondingTotalLabel={unbondingTotalLabel ?? undefined}
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
          {unbondingTotalLabel && (
            <Card className="mt-2">
              <div className="font-medium">{STRINGS.waitingOnUnbondingTitle}</div>
              <div className="mt-1 text-sm text-secondary-text">
                {role === "activeLender" ? STRINGS.waitingOnUnbondingBody : STRINGS.ownerWaitingOnUnbondingBody}
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
              />
            )}
            {unbondingTotalLabel && (
              <Card className="p-2">
                <div className="text-secondary-text">{STRINGS.waitingToUnlock}</div>
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
                <div className="text-secondary-text">{STRINGS.maturedClaimableNow}</div>
                {maturedEntries.length > 0 ? (
                  <ul className="mt-1 text-sm space-y-1">
                    {maturedEntries.map((m, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="truncate" title={m.validator}>{m.validator}</span>
                        <span className="font-medium">{safeFormatYoctoNear(m.amount)} NEAR</span>
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
          {role === "activeLender" ? (
            <div className="mt-2 text-xs text-secondary-text">{STRINGS.lenderLiquidationNote}</div>
          ) : isOwner ? (
            <div className="mt-2 text-xs text-secondary-text">{STRINGS.ownerLiquidationNote}</div>
          ) : null}
          {role !== "activeLender" && !isOwner && (
            <div className="mt-2 text-right">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-3 h-10 rounded border bg-surface disabled:opacity-60 w-full sm:w-auto"
                onClick={() => {
                  const txHash = `manual-refresh-${Date.now()}`;
                  void indexVault({ factoryId, vault: vaultId, txHash });
                  refetch();
                  refetchAvail();
                }}
                title={STRINGS.refresh}
                disabled={vaultLoading || availLoading}
              >
                {vaultLoading || availLoading ? "Refreshing…" : STRINGS.refresh}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Repay dialog consolidated below */}

      {/* Post-expiry lender popup is rendered below with tighter guards to ensure required data is present */}

      {isOwner && hasOpenRequest && vaultRegisteredForToken === false && (
        <div className="mt-3 rounded border border-amber-500/30 bg-amber-100/40 text-amber-900 p-3 text-sm">
          <div className="font-medium">Vault registration required</div>
          <div className="mt-1">
            Your vault is not registered with this token contract yet. To receive funds from a lender, register the vault with the token.
            {ownerMinDeposit && (
              <>
                {" "}This is a one-time storage deposit of {utils.format.formatNearAmount(ownerMinDeposit)} NEAR.
              </>
            )}
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={onRegisterVaultForToken}
              disabled={storagePending || !ownerMinDeposit}
              className="inline-flex items-center gap-2 px-3 h-9 rounded bg-primary text-primary-text disabled:opacity-50"
            >
              {storagePending ? "Registering…" : "Register vault with token"}
            </button>
            {content?.token && (
              <a
                href={explorerAccountUrl(network, content.token)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 inline-flex items-center text-primary underline"
              >
                View token on Explorer
              </a>
            )}
            <a
              href="/docs/token-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center text-primary underline"
            >
              Learn more
            </a>
            {storageError && <div className="mt-2 text-xs text-red-600">{storageError}</div>}
          </div>
        </div>
      )}

      <style jsx>{`
        .coin-scene { width: 44px; height: 44px; perspective: 800px; }
        .coin { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; animation: coin-spin 12s linear infinite; will-change: transform; }
        .face { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 50%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .front { background-image: url('/usdc.svg'); }
        .back { background-image: url('/near-coin.svg'); transform: rotateY(180deg); }
        @keyframes coin-spin { 0% { transform: rotateX(6deg) rotateY(0deg);} 50% { transform: rotateX(6deg) rotateY(180deg);} 100% { transform: rotateX(6deg) rotateY(360deg);} }
      `}</style>
      {isOwner && (
        <RequestLiquidityDialog open={openDialog} onClose={() => setOpenDialog(false)} vaultId={vaultId} />
      )}

      {/* Lender confirmation dialog */}
      {acceptOpen && content && data?.liquidity_request && (
        <AcceptConfirm
          open={acceptOpen}
          onClose={() => setAcceptOpen(false)}
          onConfirm={onAccept}
          pending={pending}
          error={acceptError ?? undefined}
          vaultId={vaultId}
          tokenId={content.token}
          tokenSymbol={tokenSymbol}
          amountRaw={data.liquidity_request.amount}
          interestRaw={data.liquidity_request.interest}
          collateralYocto={data.liquidity_request.collateral}
          durationDays={content.durationDays}
          network={network}
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

type AcceptConfirmProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  error?: string;
  vaultId: string;
  tokenId: string;
  tokenSymbol: string;
  amountRaw: string; // minimal units
  interestRaw: string; // minimal units
  collateralYocto: string; // yoctoNEAR
  durationDays: number;
  network: Network;
};

function AcceptConfirm({
  open,
  onClose,
  onConfirm,
  pending,
  error,
  vaultId,
  tokenId,
  tokenSymbol,
  amountRaw,
  interestRaw,
  collateralYocto,
  durationDays,
  network,
}: AcceptConfirmProps) {
  // Resolve decimals for formatting
  const decimals = getTokenDecimals(tokenId, network);
  const lendAmount = formatMinimalTokenAmount(amountRaw, decimals);
  let totalRepay = "-";
  try {
    const sum = (BigInt(amountRaw) + BigInt(interestRaw)).toString();
    totalRepay = formatMinimalTokenAmount(sum, decimals);
  } catch {}
  const collateralNear = utils.format.formatNearAmount(collateralYocto);

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title="Confirm acceptance"
      disableBackdropClose={pending}
      footer={
        <>
          <button
            type="button"
            className="rounded border py-2 px-3 bg-surface hover:bg-surface/90 disabled:opacity-60"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ml-2 rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Confirming…" : "Confirm accept"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p>
          You are about to lend <span className="font-medium">{lendAmount} {tokenSymbol}</span> to
          {" "}
          <span className="font-medium" title={vaultId}>{vaultId}</span> via ft_transfer_call.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            On-time repayment (within {formatDays(durationDays)}) should return a total of
            {" "}
            <span className="font-medium">{totalRepay} {tokenSymbol}</span> (principal + interest).
          </li>
          <li>
            If the vault does not repay before the term ends, your claim can be fulfilled from the vault’s
            collateral of <span className="font-medium">{collateralNear} NEAR</span>.
          </li>
          <li>
            This transaction will transfer tokens to the vault and attach a 1 yoctoNEAR deposit.
          </li>
        </ul>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}
