"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { Button } from "@/app/components/ui/Button";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { sumMinimal } from "@/utils/amounts";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { calculateApr } from "@/utils/finance";
import { formatMinimalTokenAmount } from "@/utils/format";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { getActiveFactoryId, getActiveNetwork } from "@/utils/networks";
import { formatDurationFromSeconds } from "@/utils/time";
import { getTokenConfigById } from "@/utils/tokens";
import { showToast } from "@/utils/toast";

const FALLBACK_REQUEST = [
  { label: "Amount", value: "5,000 USDC" },
  { label: "Interest", value: "120 USDC" },
  { label: "Repay", value: "5,120 USDC" },
  { label: "Term", value: "30d" },
  { label: "Collateral", value: "1,250 NEAR" },
  { label: "Est. APR", value: "29.20%" },
];
const LIVE_REQUEST_ROTATION_MS = 8000;

export function Hero() {
  const { signIn, walletSelector } = useWalletSelector();
  const [connecting, setConnecting] = React.useState(false);
  const [network, setNetwork] = React.useState<string>("");
  const [factoryId, setFactoryId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setNetwork(getActiveNetwork());
    setFactoryId(getActiveFactoryId());
  }, []);
  const { data: pendingRequests, loading: pendingLoading, error: pendingError } = usePendingRequests(factoryId);
  const liveRequests = React.useMemo(
    () => (pendingRequests ?? []).filter((item) => Boolean(item.liquidity_request)).slice(0, 3),
    [pendingRequests]
  );
  const [liveRequestIndex, setLiveRequestIndex] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  React.useEffect(() => {
    if (prefersReducedMotion || liveRequests.length <= 1) return;
    const timer = window.setInterval(() => {
      setLiveRequestIndex((prev) => (prev + 1) % liveRequests.length);
    }, LIVE_REQUEST_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [liveRequests.length, prefersReducedMotion]);
  const activeLiveRequestIndex = React.useMemo(
    () => (liveRequests.length > 0 ? liveRequestIndex % liveRequests.length : 0),
    [liveRequestIndex, liveRequests.length]
  );
  const liveRequest = React.useMemo(
    () => liveRequests[activeLiveRequestIndex],
    [liveRequests, activeLiveRequestIndex]
  );
  const requestTokenId = liveRequest?.liquidity_request?.token ?? "";
  const requestNetwork = React.useMemo(
    () => (factoryId ? networkFromFactoryId(factoryId) : null),
    [factoryId]
  );
  const requestTokenCfg = React.useMemo(
    () => (requestTokenId && requestNetwork ? getTokenConfigById(requestTokenId, requestNetwork) : undefined),
    [requestTokenId, requestNetwork]
  );
  const { meta: requestTokenMeta } = useTokenMetadata(requestTokenId);
  const requestTokenDecimals = requestTokenMeta.decimals ?? requestTokenCfg?.decimals ?? 6;
  const requestTokenSymbol = React.useMemo(() => {
    if (requestTokenMeta.symbol) return requestTokenMeta.symbol;
    if (requestTokenCfg?.symbol) return requestTokenCfg.symbol;
    return "FT";
  }, [requestTokenMeta.symbol, requestTokenCfg?.symbol]);
  const requestRows = React.useMemo(() => {
    const lr = liveRequest?.liquidity_request;
    if (!lr) return FALLBACK_REQUEST;
    const amount = formatMinimalTokenAmount(lr.amount, requestTokenDecimals);
    const totalRepayment = formatMinimalTokenAmount(sumMinimal(lr.amount, lr.interest), requestTokenDecimals);
    const interest = formatMinimalTokenAmount(lr.interest, requestTokenDecimals);
    const collateral = safeFormatYoctoNear(lr.collateral, 5);
    const apr = calculateApr(lr.interest, lr.amount, lr.duration).times(100);
    const aprLabel = apr.gt(0) ? `${apr.round(2, 0 /* RoundDown */).toString()}%` : "—";
    return [
      { label: "Amount", value: `${amount} ${requestTokenSymbol}` },
      { label: "Interest", value: `${interest} ${requestTokenSymbol}` },
      { label: "Repay", value: `${totalRepayment} ${requestTokenSymbol}` },
      { label: "Term", value: formatDurationFromSeconds(lr.duration) },
      { label: "Collateral", value: `${collateral} NEAR` },
      { label: "Est. APR", value: aprLabel },
    ];
  }, [liveRequest, requestTokenDecimals, requestTokenSymbol]);
  const hasLiveRequest = Boolean(liveRequest?.liquidity_request);
  const [slowConnect, setSlowConnect] = React.useState(false);
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (connecting) {
      t = setTimeout(() => setSlowConnect(true), 300);
    } else {
      setSlowConnect(false);
    }
    return () => {
      clearTimeout(t);
    };
  }, [connecting]);
  React.useEffect(() => {
    if (!walletSelector) return;
    let isMounted = true;
    let subscription: { remove: () => void } | undefined;
    walletSelector
      .then((selector) => {
        if (!isMounted) return;
        const modal = setupModal(selector, {
          contractId: selector.options.createAccessKeyFor?.contractId,
          methodNames: selector.options.createAccessKeyFor?.methodNames ?? [],
        });
        const handleHide = () => {
          setConnecting(false);
          setSlowConnect(false);
        };
        subscription = modal.on("onHide", handleHide);
      })
      .catch((err) => {
        console.error("Failed to initialise wallet selector modal", err);
        showToast("Wallet connection failed to initialise.", { variant: "error" });
        setConnecting(false);
        setSlowConnect(false);
      });
    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [walletSelector]);
  const handleConnect = React.useCallback(() => {
    setConnecting(true);
    Promise.resolve(signIn()).catch((err) => {
      console.error("Wallet sign-in failed", err);
      showToast("Wallet connection failed. Please try again.", { variant: "error" });
      setConnecting(false);
      setSlowConnect(false);
    });
  }, [signIn]);
  const networkLabel = network ? network : "testnet";
  const requestPanelNote = hasLiveRequest
    ? "Cycling through latest open requests from Discover."
    : pendingLoading
      ? "Loading open requests…"
      : pendingError
        ? "Open request feed is unavailable. Showing sample values."
        : "No open requests right now.";

  return (
    <section className="mt-12 sm:mt-16">
      <div className="rounded-2xl border border-white/12 bg-surface px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text">
          <span className="rounded-full border border-white/12 bg-background/70 px-3 py-1 uppercase">
            {networkLabel}
          </span>
          {network && network !== "mainnet" && (
            <span className="rounded-full border border-white/12 bg-background/70 px-3 py-1">
              Testnet: demo balances
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(260px,1fr)]">
          <div className="space-y-4">
            <h1 className="text-[clamp(1.9rem,3.8vw,2.5rem)] font-semibold leading-tight text-foreground">
              USDC loans backed by staked NEAR.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-secondary-text">
              Borrowers create loan requests using NEAR collateral. Lenders fund those requests and earn interest when loans
              are repaid.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className="w-full sm:w-auto"
                size="lg"
                onClick={handleConnect}
                disabled={connecting}
                aria-busy={connecting || undefined}
              >
                {connecting ? "Opening wallet…" : "Borrow: Open Dashboard"}
              </Button>
              <Link href="/discover" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Lend: Browse Requests
                </Button>
              </Link>
            </div>

            {connecting && (
              <p className="text-xs text-secondary-text/90" role="status" aria-live="polite">
                {slowConnect ? "Check your wallet to continue." : "Opening wallet…"}
              </p>
            )}

            <div className="rounded-xl border border-white/12 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text">What happens next</p>
              <ol className="mt-2 space-y-1.5 text-sm text-secondary-text">
                <li>1. Borrowers: connect wallet, create a vault, then open a USDC request.</li>
                <li>2. Lenders: browse requests, review terms, then fund the one you want.</li>
                <li>3. New to the flow? Read the <Link href="/docs/playbook" className="text-primary hover:text-primary/80">quick playbook</Link>.</li>
              </ol>
            </div>
          </div>

          <aside className="rounded-xl border border-white/12 bg-background/70 p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              Current borrower requests
              {liveRequests.length > 1 ? (
                <span className="ml-2 text-xs text-secondary-text">
                  {activeLiveRequestIndex + 1}/{liveRequests.length}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-secondary-text">
              Terms shown here are what lenders review before funding.
            </p>
            {hasLiveRequest && liveRequest?.id && (
              <p className="mt-2 text-xs text-secondary-text">
                Vault <span className="font-mono break-all text-foreground/90">{liveRequest.id}</span>
              </p>
            )}

            <dl className="mt-4 space-y-3">
              {requestRows.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <dt className="text-xs uppercase tracking-wide text-secondary-text/80">{item.label}</dt>
                  <dd className="text-sm font-semibold text-foreground text-right">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs text-secondary-text">{requestPanelNote}</p>

            <Link
              href="/discover"
              className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary/80"
            >
              Go to marketplace
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
