"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { getActiveFactoryId } from "@/utils/networks";
import { PendingRequestsList } from "@/app/components/discover/PendingRequestsList";
import { Container } from "@/app/components/layout/Container";
import { Button } from "@/app/components/ui/Button";
import { APP_ROUTES } from "@/app/components/navigationRoutes";
import { showToast } from "@/utils/toast";

export default function DiscoverPage() {
  const { signedAccountId, signIn } = useWalletSelector();
  const factoryId = getActiveFactoryId();
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

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-34vh] h-[62vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.2),transparent_68%)]"
      />
      <Container className="relative pt-8 sm:pt-10 lg:pt-12">
        <main id="main" className="space-y-5">
          <header className="surface-card rounded-3xl px-5 py-6 shadow-[0_18px_62px_-44px_rgba(15,23,42,0.55)] sm:px-6 sm:py-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/85">Discover</p>
                <h1 className="text-[clamp(1.75rem,3.4vw,2.35rem)] font-semibold leading-tight text-foreground">
                  Open lending opportunities
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
                  Evaluate live borrower requests, filter terms in seconds, and open a vault to fund directly from your wallet.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {signedAccountId ? (
                  <Link href={APP_ROUTES.dashboard.href}>
                    <Button size="sm" variant="secondary">
                      Open dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="secondary" onClick={onConnect} disabled={connecting} aria-busy={connecting || undefined}>
                    {connecting ? "Opening wallet..." : "Connect wallet"}
                  </Button>
                )}
                <Link href="/docs/guides/fund-liquidity-request">
                  <Button size="sm" variant="secondary">
                    Funding guide
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <PendingRequestsList factoryId={factoryId} />
        </main>
      </Container>
    </div>
  );
}
