"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Big from "big.js";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { Button } from "@/app/components/ui/Button";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { calculateApr } from "@/utils/finance";
import { formatMinimalTokenAmount } from "@/utils/format";
import { safeFormatYoctoNear } from "@/utils/formatNear";
import { getActiveFactoryId } from "@/utils/networks";
import { formatDurationWords } from "@/utils/time";
import { getTokenConfigById } from "@/utils/tokens";
import { showToast } from "@/utils/toast";
import { APP_ROUTES, buildVaultHref } from "@/app/components/navigationRoutes";

type RequestPreview = {
  id: string;
  owner: string;
  amount: string;
  repay: string;
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
    repay: "5,120 USDC",
    term: "30 days",
    collateral: "1,250 NEAR",
    apr: "29.20%",
    href: APP_ROUTES.discover.href,
  },
  {
    id: "sample-beta",
    owner: "validator.near",
    amount: "2,750 USDC",
    repay: "2,801 USDC",
    term: "14 days",
    collateral: "640 NEAR",
    apr: "24.10%",
    href: APP_ROUTES.discover.href,
  },
];

export function Hero() {
  const pathname = usePathname();
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
      let repay = "Unavailable";
      try {
        const totalRaw = new Big(lr.amount).plus(new Big(lr.interest)).toFixed(0);
        repay = `${formatMinimalTokenAmount(totalRaw, decimals)} ${symbol}`;
      } catch {
        repay = "Unavailable";
      }
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
          owner: item.owner ?? "Unknown borrower",
          amount: `${amount} ${symbol}`,
          repay,
          term: formatDurationWords(lr.duration),
          collateral: `${collateral} NEAR`,
          apr: aprLabel,
          href: buildVaultHref(item.id, pathname),
        },
      ];
    });
  }, [liveRequests, pathname, requestNetwork]);
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
    return formatDurationWords(Math.min(...durations));
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
        <section className="surface-card pixel-card min-w-0 px-6 py-6 sm:px-8 sm:py-8">
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

        <aside className="surface-card pixel-card min-w-0 px-4 py-5 min-[360px]:px-5 min-[360px]:py-6 sm:px-6 sm:py-7">
          <header className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between">
            <div>
              <p className="pixel-heading text-sm text-foreground">Live lending opportunities</p>
            </div>
            <Link href={APP_ROUTES.discover.href} className="pixel-link text-xs text-primary hover:text-primary">
              Discover
            </Link>
          </header>

          <div className="mt-4 flex flex-wrap gap-2">
            <BoardSummaryPill label="Open" value={pendingLoading ? "..." : String(totalOpenRequests)} />
            <BoardSummaryPill label="Avg APR" value={pendingLoading ? "..." : averageApr} />
            <BoardSummaryPill label="Shortest loan" value={pendingLoading ? "..." : shortestTerm} />
          </div>

          {displayedRequests.length > 0 ? (
            <div className="mt-4 space-y-2">
              {displayedRequests.map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={item.href}
                  className="group block surface-panel px-3.5 py-3 transition-[border-color,background-color,color,transform] duration-150 hover:border-primary/45 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  title={showSampleRequest ? `View ${item.id} example` : `Open ${item.id}`}
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-foreground">Lend {item.amount}</p>
                    <p className="mt-1 break-words text-xs text-secondary-text">
                      Get {item.repay} back in {item.term}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-secondary-text">
                    Borrower{" "}
                    <span className="font-mono text-foreground" title={item.owner}>
                      {shortAccountLabel(item.owner)}
                    </span>
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-2.5 py-1 font-semibold text-foreground">
                      {item.apr === "—" ? "Return unavailable" : `${item.apr} APR`}
                    </span>
                    <span className="rounded-full border border-[color:var(--panel-border)] bg-transparent px-2.5 py-1 text-secondary-text">
                      Collateral {item.collateral}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface-panel mt-4 border-dashed px-4 py-5 text-sm text-secondary-text">
              {pendingLoading
                ? "Loading opportunities to fund..."
                : "No opportunities to fund right now. Check Discover for updates."}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function BoardSummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[color:var(--panel-border)] bg-[color:var(--surface)] px-3 py-1.5 text-xs shadow-[var(--pixel-shadow)]">
      <span className="whitespace-nowrap text-secondary-text">{label}</span>
      <span className="min-w-0 break-words font-semibold text-foreground">{value}</span>
    </div>
  );
}

function shortAccountLabel(accountId: string) {
  if (accountId.length <= 22) return accountId;
  return `${accountId.slice(0, 9)}…${accountId.slice(-8)}`;
}
