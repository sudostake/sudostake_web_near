"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { Button } from "@/app/components/ui/Button";
import { getActiveNetwork } from "@/utils/networks";
import { showToast } from "@/utils/toast";

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
    return () => { if (t) clearTimeout(t); };
  }, [connecting]);
  React.useEffect(() => {
    if (!walletSelector) return;
    let isMounted = true;
    let subscription: { remove: () => void } | undefined;
    walletSelector.then((selector) => {
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
    }).catch((err) => {
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
    <section className="mt-20 md:mt-24">
      <div className="w-full">
        <div className="grid items-start gap-y-10 gap-x-16 lg:grid-cols-[minmax(0,1.1fr),minmax(280px,320px)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Get started
            </p>
            <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.1rem)] font-semibold leading-tight">
              Keep NEAR staked. Borrow USDC.
            </h1>
            <p className="mt-4 max-w-xl text-base text-secondary-text leading-relaxed">
              Access liquidity without handing over custody. Approve, draw, and repay straight from the vault you control.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <Button size="lg" variant="secondary" className="w-full sm:w-auto whitespace-nowrap">
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
                className="mt-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-secondary-text"
                role="note"
              >
                {network.charAt(0).toUpperCase() + network.slice(1)} • funds are for testing only
              </span>
            )}
          </div>
          <aside className="rounded-2xl border bg-surface/70 p-6 text-sm shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-text">Borrow at a glance</h2>
            <dl className="mt-4 space-y-5 text-secondary-text">
              <div className="flex gap-3">
                <dt className="font-mono text-xs font-semibold text-primary/90">01</dt>
                <dd>
                  <p className="font-medium text-foreground">Vault stays in your custody</p>
                  <p className="mt-1 text-sm leading-relaxed">Smart contracts execute only after you approve the action.</p>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-mono text-xs font-semibold text-primary/90">02</dt>
                <dd>
                  <p className="font-medium text-foreground">Terms stay locked in</p>
                  <p className="mt-1 text-sm leading-relaxed">Ratios, amounts, and timelines are visible before any lender commits.</p>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-mono text-xs font-semibold text-primary/90">03</dt>
                <dd>
                  <p className="font-medium text-foreground">Every movement is on-chain</p>
                  <p className="mt-1 text-sm leading-relaxed">Deposits, draws, and repayments stay auditable on NEAR.</p>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
