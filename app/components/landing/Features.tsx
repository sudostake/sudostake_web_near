"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { APP_ROUTES } from "@/app/components/navigationRoutes";
import { showToast } from "@/utils/toast";

type FeaturePath = {
  key: "borrow" | "lend";
  title: string;
  summary: string;
  steps: string[];
  cta: string;
};

export function Features() {
  const { signedAccountId, signIn } = useWalletSelector();
  const [connecting, setConnecting] = React.useState(false);

  const onConnect = React.useCallback(() => {
    if (connecting) return;
    setConnecting(true);
    Promise.resolve(signIn())
      .catch((err) => {
        console.error("Wallet sign-in failed", err);
        showToast("Wallet connection failed. Please try again.", { variant: "error" });
      })
      .finally(() => setConnecting(false));
  }, [connecting, signIn]);

  const paths = React.useMemo<FeaturePath[]>(
    () => [
      {
        key: "borrow",
        title: "I want to borrow",
        summary: signedAccountId
          ? "Create a vault, open a USDC request, and manage repayment from the dashboard."
          : "Connect your wallet, then open a vault and launch a USDC request.",
        steps: [
          "Connect a supported wallet.",
          "Create your vault and open a request.",
          "Repay before liquidation starts.",
        ],
        cta: signedAccountId ? "Start borrower flow" : "Connect to borrow",
      },
      {
        key: "lend",
        title: "I want to lend",
        summary: "Use Discover to review live requests and fund one directly from your wallet.",
        steps: [
          "Browse open requests in Discover.",
          "Check amount, term, collateral, and APR.",
          "Accept a request when terms fit your strategy.",
        ],
        cta: "Open Discover",
      },
    ],
    [signedAccountId]
  );

  return (
    <section className="mt-28">
      <div className="surface-card pixel-card p-6 sm:p-10">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="section-heading text-foreground">Choose your next action</h2>
            <p className="text-base leading-relaxed text-secondary-text sm:text-sm">
              Pick the path that matches what you want to do right now and jump straight into the flow.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {paths.map((path) => (
              <div key={path.title} className="surface-panel p-6">
                <h3 className="pixel-heading text-xs text-foreground">{path.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-text">{path.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-secondary-text">
                  {path.steps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-1 inline-flex h-1.5 w-1.5 bg-primary/80" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                {path.key === "borrow" ? (
                  signedAccountId ? (
                    <Link href={APP_ROUTES.dashboard.href} className="mt-5 inline-flex">
                      <Button variant="primary" size="md">
                        {path.cta}
                      </Button>
                    </Link>
                  ) : (
                    <div className="mt-5 inline-flex">
                      <Button variant="primary" size="md" onClick={onConnect} disabled={connecting} aria-busy={connecting || undefined}>
                        {connecting ? "Opening wallet..." : path.cta}
                      </Button>
                    </div>
                  )
                ) : (
                  <Link href={APP_ROUTES.discover.href} className="mt-5 inline-flex">
                    <Button variant="primary" size="md">
                      {path.cta}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <Link href={APP_ROUTES.docs.href} className="pixel-link inline-flex items-center gap-2 text-xs text-primary hover:text-primary">
            Need details first? Read docs
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 items-center justify-center border-2 border-primary/30 bg-primary/10 text-sm"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
