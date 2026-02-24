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

const START_STEPS = [
  "Connect your NEAR wallet.",
  "Choose borrow or lend flow.",
  "Execute and monitor from dashboard.",
];

const VALUE_POINTS = [
  "Non-custodial by design",
  "On-chain terms and settlement",
  "Real-time request discovery",
];

export function Hero() {
  const { signIn, walletSelector, signedAccountId } = useWalletSelector();
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
  const requestPanelNote = pendingLoading
    ? "Refreshing live requests..."
    : pendingError
      ? "Live request feed is unavailable. Showing sample terms."
      : hasLiveRequests
        ? `Tracking ${totalOpenRequests} open request${totalOpenRequests === 1 ? "" : "s"} in real time.`
        : "No open requests right now.";

  return (
    <section className="relative mt-6 sm:mt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-18 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.24),transparent_72%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.12),transparent_70%)] blur-3xl"
      />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.12fr),minmax(320px,0.88fr)] lg:items-start">
        <section className="surface-card rounded-[30px] px-6 py-6 shadow-[0_24px_72px_-52px_rgba(15,23,42,0.58)] sm:px-8 sm:py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/90 animate-pulse-soft" />
            Stake-backed liquidity on NEAR
          </div>

          <h1 className="mt-4 text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground">
            Connect wallet. Pick a side. Execute.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
            Borrow USDC against staked NEAR or fund active requests with clear on-chain terms. No custody handoff.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleConnect}
              disabled={connecting}
              aria-busy={connecting || undefined}
            >
              {connecting ? "Opening wallet..." : "Connect wallet"}
            </Button>
            {signedAccountId ? (
              <Link href={APP_ROUTES.dashboard.href} className="w-full">
                <Button size="lg" variant="secondary" className="w-full">
                  Borrow with vault
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={handleConnect}
                disabled={connecting}
                aria-busy={connecting || undefined}
              >
                {connecting ? "Opening wallet..." : "Connect to borrow"}
              </Button>
            )}
            <Link href={APP_ROUTES.discover.href} className="w-full">
              <Button size="lg" variant="secondary" className="w-full">
                Lend in Discover
              </Button>
            </Link>
          </div>

          {connecting && (
            <p className="mt-3 text-xs text-secondary-text" role="status" aria-live="polite">
              {slowConnect ? "Check your wallet to continue." : "Opening wallet..."}
            </p>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {VALUE_POINTS.map((point) => (
              <p
                key={point}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >
                {point}
              </p>
            ))}
          </div>

          <div className="mt-7 border-t border-[color:var(--border)] pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Fast start</p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {START_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-3 text-xs leading-relaxed text-secondary-text"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
                  <p className="mt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="surface-card rounded-[30px] px-5 py-6 shadow-[0_24px_72px_-52px_rgba(15,23,42,0.58)] sm:px-6 sm:py-7">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Live request board</p>
              <p className="mt-1 text-xs text-secondary-text">Snapshot of active borrower demand.</p>
            </div>
            <Link href={APP_ROUTES.discover.href} className="text-xs font-medium text-primary hover:text-primary/80">
              Open Discover
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
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3"
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
                    <Link href={item.href} className="shrink-0 font-medium text-primary hover:text-primary/80">
                      {showSampleRequest ? "View examples" : "Open vault"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-5 text-sm text-secondary-text">
              {pendingLoading
                ? "Loading the latest open requests..."
                : "No open requests right now. Check Discover for updates."}
            </div>
          )}

          <p className="mt-4 text-xs text-secondary-text">{requestPanelNote}</p>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-secondary-text">
            <Link href={APP_ROUTES.docs.href} className="hover:text-primary">
              Read docs
            </Link>
            <Link href="/docs/features/authentication-signin-flow" className="hover:text-primary">
              Auth flow
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function BoardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-secondary-text">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
