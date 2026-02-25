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
import { APP_ROUTES } from "@/app/components/navigationRoutes";

type RequestPreview = {
  id: string;
  owner: string;
  amount: string;
  term: string;
  collateral: string;
  apr: string;
  href: string;
};

const SAMPLE_REQUEST_PREVIEWS: RequestPreview[] = [
  {
    id: "sample-alpha",
    owner: "owner.near",
    amount: "5,000 USDC",
    term: "30d",
    collateral: "1,250 NEAR",
    apr: "29.20%",
    href: APP_ROUTES.discover.href,
  },
  {
    id: "sample-beta",
    owner: "validator.near",
    amount: "2,750 USDC",
    term: "14d",
    collateral: "640 NEAR",
    apr: "24.10%",
    href: APP_ROUTES.discover.href,
  },
];

export function Hero() {
  const { signIn, walletSelector } = useWalletSelector();
  const [connecting, setConnecting] = React.useState(false);
  const [factoryId, setFactoryId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setFactoryId(getActiveFactoryId());
  }, []);
  const { data: pendingRequests, loading: pendingLoading, error: pendingError } = usePendingRequests(factoryId);
  const liveRequests = React.useMemo(
    () => (pendingRequests ?? []).filter((item) => Boolean(item.liquidity_request)),
    [pendingRequests]
  );
  const requestNetwork = React.useMemo(
    () => (factoryId ? networkFromFactoryId(factoryId) : null),
    [factoryId]
  );
  const requestPreviews = React.useMemo<RequestPreview[]>(() => {
    return liveRequests.slice(0, 5).flatMap((item) => {
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
          owner: item.owner ?? "Unknown owner",
          amount: `${amount} ${symbol}`,
          term: formatDurationFromSeconds(lr.duration),
          collateral: `${collateral} NEAR`,
          apr: aprLabel,
          href: `/dashboard/vault/${encodeURIComponent(item.id)}`,
        },
      ];
    });
  }, [liveRequests, requestNetwork]);
  const totalOpenRequests = React.useMemo(
    () => (pendingRequests ?? []).filter((item) => Boolean(item.liquidity_request)).length,
    [pendingRequests]
  );
  const averageApr = React.useMemo(() => {
    const aprValues = liveRequests.flatMap((item) => {
      const lr = item.liquidity_request;
      if (!lr) return [];
      try {
        const aprPercent = calculateApr(lr.interest, lr.amount, lr.duration).times(100);
        if (aprPercent.lte(0)) return [];
        return [Number(aprPercent.round(2, 0 /* RoundDown */).toString())];
      } catch {
        return [];
      }
    });
    if (!aprValues.length) return "n/a";
    const average = aprValues.reduce((sum, value) => sum + value, 0) / aprValues.length;
    return `${average.toFixed(2)}%`;
  }, [liveRequests]);
  const shortestTerm = React.useMemo(() => {
    const durations = liveRequests.flatMap((item) => {
      const value = item.liquidity_request?.duration ?? 0;
      return value > 0 ? [value] : [];
    });
    if (!durations.length) return "n/a";
    return formatDurationFromSeconds(Math.min(...durations));
  }, [liveRequests]);
  const hasLiveRequests = requestPreviews.length > 0;
  const showSampleRequest = !hasLiveRequests && Boolean(pendingError);
  const displayedRequests = hasLiveRequests ? requestPreviews : showSampleRequest ? SAMPLE_REQUEST_PREVIEWS : [];
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
  return (
    <section className="relative mt-6 sm:mt-10">
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.12fr),minmax(320px,0.88fr)] lg:items-start">
        <section className="surface-card pixel-card px-6 py-6 sm:px-8 sm:py-8">
          <h1 className="pixel-hero text-[clamp(1rem,2.3vw,1.52rem)] text-foreground">
            Manage vaults and fund requests.
          </h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handleConnect}
              disabled={connecting}
              aria-busy={connecting || undefined}
            >
              {connecting ? "Opening wallet..." : "Connect wallet"}
            </Button>
            <Link href={APP_ROUTES.discover.href} className="w-full">
              <Button size="lg" variant="secondary" className="w-full">
                Discover
              </Button>
            </Link>
          </div>

          {connecting && (
            <p className="mt-3 text-xs text-secondary-text" role="status" aria-live="polite">
              {slowConnect ? "Check your wallet to continue." : "Opening wallet..."}
            </p>
          )}
        </section>

        <aside className="surface-card pixel-card px-5 py-6 sm:px-6 sm:py-7">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="pixel-heading text-[0.62rem] text-foreground">Live request board</p>
            </div>
            <Link href={APP_ROUTES.discover.href} className="pixel-link text-[0.58rem] text-primary hover:text-primary/80">
              Discover
            </Link>
          </header>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <BoardMetric label="Open now" value={pendingLoading ? "..." : String(totalOpenRequests)} />
            <BoardMetric label="Avg APR" value={pendingLoading ? "..." : averageApr} />
            <BoardMetric label="Shortest term" value={pendingLoading ? "..." : shortestTerm} />
          </div>

          {displayedRequests.length > 0 ? (
            <div className="mt-4 space-y-2">
              {displayedRequests.map((item, index) => (
                <article
                  key={`${item.id}-${index}`}
                  className="surface-panel px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.amount}</p>
                      <p className="mt-0.5 text-[11px] text-secondary-text">{item.collateral} collateral</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{item.apr}</p>
                      <p className="text-[11px] text-secondary-text">{item.term} term</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                    <p className="min-w-0 truncate text-secondary-text">
                      Owner:{" "}
                      <span className="font-mono text-foreground/90" title={item.owner}>
                        {item.owner}
                      </span>
                    </p>
                    <Link href={item.href} className="pixel-link shrink-0 text-[0.56rem] text-primary hover:text-primary/80">
                      {showSampleRequest ? "Examples" : "Vault"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-panel mt-4 border-dashed px-4 py-5 text-sm text-secondary-text">
              {pendingLoading
                ? "Loading the latest open requests..."
                : "No open requests right now. Check Discover for updates."}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function BoardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel px-2.5 py-2">
      <p className="pixel-heading text-[0.58rem] text-secondary-text">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
