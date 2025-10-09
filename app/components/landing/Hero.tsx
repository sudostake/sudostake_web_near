"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { Button } from "@/app/components/ui/Button";
import { getActiveNetwork } from "@/utils/networks";
import { showToast } from "@/utils/toast";

const HIGHLIGHTS = [
  {
    title: "Non-custodial by design",
    description: "Your validator vault never leaves your wallet. Every draw, top-up, or repay pauses for your signature.",
  },
  {
    title: "Terms stay locked in",
    description: "Set collateral buffers, interest, and deadlines before going live so lenders know exactly what they’re funding.",
  },
  {
    title: "Audit-ready history",
    description: "SudoStake keeps a clean on-chain ledger so finance teams, contributors, and lenders reconcile in minutes.",
  },
];

const SAMPLE_REQUEST = [
  { label: "Collateral posted", value: "1,250 NEAR" },
  { label: "USDC credit line", value: "5,000 USDC" },
  { label: "Target buffer", value: "165% collateral" },
  { label: "Repayment window", value: "30 days" },
];

function formatNetworkLabel(network: string) {
  if (!network) return "Ready on NEAR networks";
  const normalised =
    network === "mainnet"
      ? "NEAR Mainnet"
      : network === "testnet"
        ? "NEAR Testnet"
        : network.charAt(0).toUpperCase() + network.slice(1);
  return `Live on ${normalised}`;
}

export function Hero() {
  const { signIn, walletSelector } = useWalletSelector();
  const [connecting, setConnecting] = React.useState(false);
  const [network, setNetwork] = React.useState<string>("");
  React.useEffect(() => setNetwork(getActiveNetwork()), []);
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
  const networkLabel = formatNetworkLabel(network);
  return (
    <section className="relative mt-20 md:mt-28">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-surface/85 px-5 py-10 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.18),transparent_70%)] blur-2xl"
        />
        <div className="relative grid items-start gap-y-14 gap-x-12 lg:grid-cols-[minmax(0,1.08fr),minmax(280px,1fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              <span>{networkLabel}</span>
            </div>
            <h1 className="mt-5 text-[clamp(2.35rem,5vw,3.2rem)] font-semibold leading-tight text-foreground">
              Keep NEAR staked. Borrow USDC on demand.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-secondary-text">
              SudoStake turns your staking position into a credit line without unwinding your validators. Publish transparent
              terms, approve each action from your wallet, and keep lenders confident from request to repayment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <Button size="lg" variant="secondary" className="w-full whitespace-nowrap sm:w-auto">
                  Explore Requests
                </Button>
              </Link>
            </div>
            {connecting && (
              <p className="mt-3 text-xs text-secondary-text/90" role="status" aria-live="polite">
                {slowConnect ? "Check your wallet to continue." : "Opening wallet…"}
              </p>
            )}
            {network && network !== "mainnet" && (
              <span
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-dashed bg-background/70 px-3 py-1 text-xs text-secondary-text"
                role="note"
              >
                {network.charAt(0).toUpperCase() + network.slice(1)} • demo balances only
              </span>
            )}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-background/80 px-5 py-5 shadow-sm transition hover:border-primary/40 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.6)] sm:py-6"
                >
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-text">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="relative overflow-hidden rounded-[28px] border border-white/12 bg-background/85 p-6 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-32 rounded-b-[48px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.24),transparent_75%)]"
            />
            <div className="relative flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-secondary-text">
              <span>Sample vault request</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                Preview
              </span>
            </div>
            <dl className="relative mt-6 space-y-4">
              {SAMPLE_REQUEST.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className="text-xs uppercase tracking-wide text-secondary-text/80">{item.label}</dt>
                  <dd className="text-base font-semibold text-foreground sm:text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-secondary-text">
              These figures show how a funded request appears in the dashboard. Draft your own terms before sharing with lenders.
            </div>
            <Link
              href="/discover"
              className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              See live requests
              <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.65rem]">
                →
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
