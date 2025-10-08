"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { WalletBadges } from "@/app/components/landing/WalletBadges";
import { Container } from "@/app/components/layout/Container";

export default function LoginPage() {
  const { signedAccountId, signIn } = useWalletSelector();
  const router = useRouter();

  useEffect(() => {
    if (signedAccountId) router.replace("/dashboard");
  }, [signedAccountId, router]);

  const onConnect = () => signIn();

  // Keep this page stable: do not auto-open wallet here.

  if (signedAccountId) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-28vh] h-[55vh] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.2),transparent_65%)]"
      />
      <Container className="relative pt-16 sm:pt-20 pb-20">
        <main id="main" className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)]">
            <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-surface/95 px-6 py-8 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.68)] sm:px-8 sm:py-10">
              <div
                aria-hidden="true"
                className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.22),transparent_70%)] blur-2xl"
              />
              <div className="relative space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Welcome back</p>
                  <h1 className="text-[clamp(2.15rem,4.2vw,2.7rem)] font-semibold leading-tight text-foreground">
                    Connect your NEAR wallet to continue.
                  </h1>
                  <p className="max-w-lg text-base leading-relaxed text-secondary-text sm:text-sm">
                    Manage vaults, monitor lending positions, and request liquidity without giving up custody. Your wallet
                    stays in control for every action.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" onClick={onConnect} className="w-full sm:w-auto">
                    Connect Wallet
                  </Button>
                  <Link href="/discover" className="text-sm font-medium text-primary hover:text-primary/80">
                    Browse requests first
                  </Link>
                </div>
                <div className="grid gap-4 rounded-2xl border border-white/12 bg-background/85 px-5 py-5">
                  <h2 className="text-sm font-semibold text-foreground">Why your account stays secure</h2>
                  <ul className="space-y-2 text-sm leading-relaxed text-secondary-text sm:text-sm">
                    <li>Approve every transaction from your NEAR wallet—no custodial intermediaries.</li>
                    <li>Smart contracts enforce terms on-chain, so draws and repayments follow the rules.</li>
                    <li>Event history stays auditable for lenders and vault owners alike.</li>
                  </ul>
                  <Link
                    href="/docs/features/authentication-signin-flow"
                    className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Read how authentication works
                    <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.6rem]">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </section>
            <aside className="rounded-[28px] border border-white/12 bg-surface/95 px-5 py-7 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.6)] sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary-text/90">Supported wallets</h2>
              <div className="mt-4">
                <WalletBadges />
              </div>
              <div className="mt-6 space-y-3 text-xs leading-relaxed text-secondary-text">
                <p>
                  We work with Wallet Selector providers like Bitte, Meteor, MyNearWallet, Nightly, and Ledger. More wallets
                  can be added as the ecosystem grows.
                </p>
                <p>
                  Need to install one?{" "}
                  <Link href="https://near.org/wallets/" target="_blank" rel="noreferrer" className="font-medium text-primary underline">
                    Explore wallet options
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </main>
      </Container>
    </div>
  );
}
