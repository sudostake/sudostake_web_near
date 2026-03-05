"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { WalletBadges } from "@/app/components/landing/WalletBadges";
import { Container } from "@/app/components/layout/Container";
import { APP_ROUTES } from "@/app/components/navigationRoutes";
import { useRouteAccess } from "@/app/hooks/useRouteAccess";

export default function LoginPage() {
  const { signIn } = useWalletSelector();
  const { blocked } = useRouteAccess("guestOnly");

  const onConnect = () => signIn();

  // Keep this page stable: do not auto-open wallet here.

  if (blocked) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-28vh] h-[55vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.2),transparent_65%)]"
      />
      <Container className="relative pt-16 sm:pt-20 pb-20">
        <main id="main" className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)]">
            <section className="surface-card relative overflow-hidden rounded-4xl px-6 py-8 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.68)] sm:px-8 sm:py-10">
              <div
                aria-hidden="true"
                className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22),transparent_70%)] blur-2xl"
              />
              <div className="relative space-y-6">
                <div className="space-y-3">
                  <h1 className="text-[clamp(2.15rem,4.2vw,2.7rem)] font-semibold leading-tight text-foreground">
                    Connect wallet
                  </h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" onClick={onConnect} className="w-full sm:w-auto">
                    Connect Wallet
                  </Button>
                  <Link href={APP_ROUTES.discover.href} className="text-sm font-medium text-primary hover:text-primary">
                    Discover
                  </Link>
                </div>
              </div>
            </section>
            <aside className="surface-card rounded-[28px] px-5 py-7 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.6)] sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-text">Supported wallets</h2>
              <div className="mt-4">
                <WalletBadges />
              </div>
            </aside>
          </div>
        </main>
      </Container>
    </div>
  );
}
