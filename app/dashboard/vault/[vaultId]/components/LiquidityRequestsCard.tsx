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
import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from "@/utils/constants";
import { useAcceptLiquidityRequest } from "@/hooks/useAcceptLiquidityRequest";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useFtBalance } from "@/hooks/useFtBalance";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { useFtStorage } from "@/hooks/useFtStorage";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { tsToDate } from "@/utils/firestoreTimestamps";

type Props = { vaultId: string; factoryId: string; onAfterAccept?: () => void };


// Firestore timestamp converter is centralized in utils/firestoreTimestamps


function formatTokenAmount(minimal: string, tokenId: string, network: Network): string {
  const cfg = getTokenConfigById(tokenId, network);
  const decimals = cfg?.decimals ?? getTokenDecimals(tokenId, network);
  const sym = cfg?.symbol ?? "FT";
  const cleaned = formatMinimalTokenAmount(minimal, decimals);
  return `${cleaned} ${sym}`;
}

export function LiquidityRequestsCard({ vaultId, factoryId, onAfterAccept }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const { data } = useVault(factoryId, vaultId);
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
    return { amount, interest, collateral, durationDays, token: req.token, amountRaw: req.amount };
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
  React.useEffect(() => {
    if (!expiryDate) { setRemainingMs(null); return; }
    const tick = () => {
      setRemainingMs(Math.max(0, expiryDate.getTime() - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiryDate]);

  const formattedCountdown = useMemo(() => {
    if (remainingMs === null) return null;
    let s = Math.floor(remainingMs / 1000);
    const days = Math.floor(s / SECONDS_PER_DAY); s -= days * SECONDS_PER_DAY;
    const hours = Math.floor(s / SECONDS_PER_HOUR); s -= hours * SECONDS_PER_HOUR;
    const minutes = Math.floor(s / 60); s -= minutes * 60;
    const seconds = s;
    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
    } else if (hours > 0) {
      parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
    } else if (minutes > 0) {
      parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
    } else {
      parts.push(`${seconds}s`);
    }
    return parts.join(" ");
  }, [remainingMs]);

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

  // Stubbed cancel action — to be implemented in next PR.
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
        <div className={`mt-3 rounded border p-3 text-sm ${vaultUsdcRegistered ? "border-emerald-500/30 bg-emerald-100/30 text-emerald-900" : "border-amber-500/30 bg-amber-100/40 text-amber-900"}`}>
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
            <div>
              <div className="text-secondary-text">Collateral</div>
              <div className="font-medium">{content.collateral}</div>
            </div>
            <div>
              <div className="text-secondary-text">Duration</div>
              <div className="font-medium">{content.durationDays} days</div>
            </div>
          </div>
          {data?.state === "active" && expiryDate && (
            <div className="mt-2 text-sm">
              <span className="text-secondary-text">Time to expiry: </span>
              <span className={remainingMs === 0 ? "text-red-600 font-medium" : "font-medium"}>
                {formattedCountdown ?? "—"}
              </span>
            </div>
          )}
          {data?.state === "active" && acceptedAtDate && (
            <div className="mt-1 text-xs text-secondary-text">
              Accepted at: <span className="text-foreground">{acceptedAtDate.toLocaleString()}</span>
            </div>
          )}
          {data?.state === "active" && role === "activeLender" && (
            <div className="mt-3 rounded border border-emerald-500/30 bg-emerald-100/50 text-emerald-900 p-2 text-sm">
              <span className="font-medium">You provided the funds for this loan.</span>
              {acceptedAtDate && <>{" "}Accepted on {acceptedAtDate.toLocaleString()}</>}
            </div>
          )}
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
                    {storageError && <div className="mt-1 text-xs text-red-600">{storageError}</div>}
                  </div>
                </div>
              )}
              {vaultRegisteredForToken === false && (
                <div className="text-left text-sm text-red-700 bg-red-100/70 border border-red-500/30 rounded p-2">
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
          {isOwner && data?.state === "active" && (
            <div className="mt-3 text-right">
              <button
                type="button"
                disabled={true}
                title="Repay will be available in the next update"
                className="inline-flex items-center gap-2 px-3 h-9 rounded border bg-surface disabled:opacity-50"
              >
                Repay loan (soon)
              </button>
            </div>
          )}
        </div>
      )}

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
        .coin-scene { width: 48px; height: 48px; perspective: 800px; }
        .coin { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: coin-spin 12s linear infinite; will-change: transform; }
        .face { position: absolute; inset: 0; background-size: cover; background-position: center; border-radius: 50%; backface-visibility: hidden; }
        .front { background-image: url('/usdc.png'); }
        .back { background-image: url('/near.svg'); transform: rotateY(180deg); }
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
  } catch {
    // Error computing totalRepay; fallback value '-' is already set.
  }
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
            On-time repayment (within {durationDays} days) should return a total of
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
