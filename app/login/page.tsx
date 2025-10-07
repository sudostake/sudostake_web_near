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
    <div className="min-h-screen bg-background pb-20">
      <Container className="pt-24 pb-16">
        <main id="main" className="mx-auto max-w-3xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)]">
            <section className="rounded-2xl border bg-surface p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Welcome back</p>
              <h1 className="mt-4 text-[clamp(2rem,4vw,2.5rem)] font-semibold leading-tight">
                Connect your NEAR wallet to continue.
              </h1>
              <p className="mt-3 text-sm text-secondary-text max-w-lg">
                Sign in to manage vaults, monitor lending positions, and request liquidity without giving up custody.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" onClick={onConnect} className="w-full sm:w-auto">
                  Connect Wallet
                </Button>
                <Link href="/discover" className="text-sm text-secondary-text hover:text-primary">
                  Browse requests first
                </Link>
              </div>
              <div className="mt-8 rounded-2xl border bg-surface-muted/60 p-5">
                <h2 className="text-sm font-semibold text-foreground">Why this stays safe</h2>
                <ul className="mt-3 space-y-2 text-sm text-secondary-text">
                  <li>Approve every action in your NEAR wallet.</li>
                  <li>Non-custodial contracts enforce the rules on-chain.</li>
                  <li>Deposits, draws, and repayments remain auditable.</li>
                </ul>
              </div>
            </section>
            <aside className="rounded-2xl border bg-surface p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-text">Supported wallets</h2>
              <WalletBadges />
              <p className="mt-4 text-xs text-secondary-text">
                Wallet logos are simplified placeholders; we can swap for official icons whenever you’re ready.
              </p>
            </aside>
          </div>
        </main>
      </Container>
    </div>
  );
}
