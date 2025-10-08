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
    title: "Self-custodial vaults",
    description: "Lock, draw, and repay without relinquishing your keys. Every action routes back through your wallet.",
  },
  {
    title: "Immutable terms",
    description: "Publish collateral ratios, amounts, and repayment windows that lenders evaluate before committing capital.",
  },
  {
    title: "On-chain audit trail",
    description: "Trace deposits, borrows, and repayments directly on NEAR for lender confidence and borrower clarity.",
  },
];

const SAMPLE_REQUEST = [
  { label: "Collateral locked", value: "1,200 NEAR" },
  { label: "USDC requested", value: "5,000 USDC" },
  { label: "Collateral ratio", value: "165%" },
  { label: "Repay within", value: "30 days" },
];

function formatNetworkLabel(network: string) {
  if (!network) return "Live beta on NEAR";
  return `${network.charAt(0).toUpperCase()}${network.slice(1)} network`;
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
      if (t) clearTimeout(t);
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
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-surface/85 px-6 py-12 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.18),transparent_70%)] blur-2xl"
        />
        <div className="relative grid items-start gap-y-12 gap-x-16 lg:grid-cols-[minmax(0,1.08fr),minmax(280px,1fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              <span>{networkLabel}</span>
            </div>
            <h1 className="mt-5 text-[clamp(2.35rem,5vw,3.2rem)] font-semibold leading-tight text-foreground">
              Keep NEAR staked. Borrow USDC without leaving your vault.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-secondary-text">
              SudoStake lets you stay liquid while your stake keeps working. Publish on-chain terms that lenders can trust,
              approve actions from your wallet, and keep repayment guardrails crystal clear.
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
                {network.charAt(0).toUpperCase() + network.slice(1)} • funds are for testing only
              </span>
            )}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-background/80 px-4 py-4 shadow-sm transition hover:border-primary/40 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.6)]"
                >
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-secondary-text">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="relative overflow-hidden rounded-[28px] border border-white/12 bg-background/85 p-6 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.55)] backdrop-blur">
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
            <dl className="relative mt-6 space-y-5">
              {SAMPLE_REQUEST.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs uppercase tracking-wide text-secondary-text/80">{item.label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-secondary-text">
              Figures illustrate how a funded request appears in the dashboard. Publish your own terms before inviting lenders.
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
