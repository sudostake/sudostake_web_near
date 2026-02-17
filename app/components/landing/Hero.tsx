"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { Button } from "@/app/components/ui/Button";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { calculateApr } from "@/utils/finance";
import { formatMinimalTokenAmount } from "@/utils/format";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { getActiveFactoryId } from "@/utils/networks";
import { formatDurationFromSeconds } from "@/utils/time";
import { getTokenConfigById } from "@/utils/tokens";
import { showToast } from "@/utils/toast";

type RequestPreview = {
  id: string;
  amount: string;
  term: string;
  collateral: string;
  apr: string;
};

const SAMPLE_REQUEST_PREVIEW: RequestPreview = {
  id: "sample",
  amount: "5,000 USDC",
  term: "30d",
  collateral: "1,250 NEAR",
  apr: "29.20%",
};

export function Hero() {
  const { signIn, walletSelector } = useWalletSelector();
  const [connecting, setConnecting] = React.useState(false);
  const [factoryId, setFactoryId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setFactoryId(getActiveFactoryId());
  }, []);
  const { data: pendingRequests, loading: pendingLoading, error: pendingError } = usePendingRequests(factoryId);
  const liveRequests = React.useMemo(
    () => (pendingRequests ?? []).filter((item) => Boolean(item.liquidity_request)).slice(0, 3),
    [pendingRequests]
  );
  const requestNetwork = React.useMemo(
    () => (factoryId ? networkFromFactoryId(factoryId) : null),
    [factoryId]
  );
  const requestPreviews = React.useMemo<RequestPreview[]>(() => {
    return liveRequests.flatMap((item) => {
      const lr = item.liquidity_request;
      if (!lr) return [];
      const tokenCfg = requestNetwork ? getTokenConfigById(lr.token, requestNetwork) : undefined;
      const decimals = tokenCfg?.decimals ?? 6;
      const symbol = tokenCfg?.symbol ?? "FT";
      const amount = formatMinimalTokenAmount(lr.amount, decimals);
      const collateral = safeFormatYoctoNear(lr.collateral, 5);
      let aprLabel = "—";
      try {
        const apr = calculateApr(lr.interest, lr.amount, lr.duration).times(100);
        aprLabel = apr.gt(0) ? `${apr.round(2, 0 /* RoundDown */).toString()}%` : "—";
      } catch {
        aprLabel = "—";
      }
      return [
        {
          id: item.id,
          amount: `${amount} ${symbol}`,
          term: formatDurationFromSeconds(lr.duration),
          collateral: `${collateral} NEAR`,
          apr: aprLabel,
        },
      ];
    });
  }, [liveRequests, requestNetwork]);
  const hasLiveRequests = requestPreviews.length > 0;
  const showSampleRequest = !hasLiveRequests && Boolean(pendingError);
  const displayedRequests = hasLiveRequests ? requestPreviews : showSampleRequest ? [SAMPLE_REQUEST_PREVIEW] : [];
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
  const requestPanelNote = pendingLoading
    ? "Refreshing open requests…"
    : pendingError
      ? "Live request feed is unavailable. Showing sample terms."
      : hasLiveRequests
        ? `Showing ${requestPreviews.length} latest pending request${requestPreviews.length > 1 ? "s" : ""}.`
        : "No open requests right now.";
  const showRequestPanelNote = pendingLoading || pendingError || hasLiveRequests;

  return (
    <section className="mt-14 sm:mt-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr),minmax(260px,1fr)] lg:gap-12">
        <div className="space-y-5">
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Borrow USDC against your staked NEAR.
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="w-full sm:w-auto"
              size="lg"
              onClick={handleConnect}
              disabled={connecting}
              aria-busy={connecting || undefined}
            >
              {connecting ? "Opening wallet…" : "Connect Wallet"}
            </Button>
            <Link href="/discover" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse Requests
              </Button>
            </Link>
          </div>

          {connecting && (
            <p className="text-xs text-secondary-text/90" role="status" aria-live="polite">
              {slowConnect ? "Check your wallet to continue." : "Opening wallet…"}
            </p>
          )}
        </div>

        <aside className="rounded-3xl border border-white/12 bg-surface/85 p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Current open requests</p>
              <p className="mt-1 text-xs text-secondary-text">Top 3 latest pending requests.</p>
            </div>
            <Link href="/discover" className="text-xs font-medium text-primary hover:text-primary/80">
              View all
            </Link>
          </div>

          {displayedRequests.length > 0 ? (
            <div className="mt-4 space-y-3">
              {displayedRequests.map((item, index) => (
                <article key={`${item.id}-${index}`} className="rounded-2xl border border-white/10 bg-background/70 p-4">
                  <div className="flex items-center justify-end gap-3">
                    {showSampleRequest ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text/80">Sample request</p>
                    ) : (
                      <Link
                        href={`/dashboard/vault/${encodeURIComponent(item.id)}`}
                        className="text-xs font-medium text-primary hover:text-primary/80"
                      >
                        Open vault
                      </Link>
                    )}
                  </div>
                  {!showSampleRequest && (
                    <p className="mt-1 text-xs text-secondary-text">
                      Vault{" "}
                      <span className="inline-block max-w-[12rem] truncate align-bottom font-mono text-foreground/90" title={item.id}>
                        {item.id}
                      </span>
                    </p>
                  )}
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <dt className="text-xs text-secondary-text">Amount</dt>
                      <dd className="text-sm font-semibold text-foreground">{item.amount}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary-text">Est. APR</dt>
                      <dd className="text-sm font-semibold text-foreground">{item.apr}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary-text">Term</dt>
                      <dd className="text-sm font-semibold text-foreground">{item.term}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-secondary-text">Collateral</dt>
                      <dd className="text-sm font-semibold text-foreground">{item.collateral}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-background/55 px-4 py-5 text-sm text-secondary-text">
              {pendingLoading
                ? "Loading the latest open requests…"
                : "No open requests right now. Check Discover for updates."}
            </div>
          )}

          {showRequestPanelNote && <p className="mt-4 text-xs text-secondary-text">{requestPanelNote}</p>}
        </aside>
      </div>
    </section>
  );
}
