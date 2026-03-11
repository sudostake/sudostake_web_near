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
    <main id="main" className="min-h-screen bg-background">
      <Container className="space-y-6 pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12">
        <header className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold leading-tight text-foreground">
                Requests to fund
              </h1>
              <p className="max-w-2xl text-sm text-secondary-text">
                Review open requests and fund the ones you want to back.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {signedAccountId ? (
                <Link href={APP_ROUTES.dashboard.href} className="w-full sm:w-auto">
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={onConnect}
                  disabled={connecting}
                  aria-busy={connecting || undefined}
                >
                  {connecting ? "Opening wallet..." : "Connect wallet"}
                </Button>
              )}
            </div>
          </div>
        </header>

        <PendingRequestsList factoryId={factoryId} />
      </Container>
    </main>
  );
}
