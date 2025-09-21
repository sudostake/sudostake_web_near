"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { STRINGS } from "@/utils/strings";
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
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main>
        <Container>
        <div className="rounded-lg border bg-surface p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Connect your wallet</h1>
          <p className="mt-2 text-secondary-text">
            Sign in with your NEAR wallet to access your dashboard, manage vaults, and track lending positions.
          </p>

          <div className="mt-6">
            <Button size="lg" onClick={onConnect} className="w-full md:w-auto">
              Connect Wallet
            </Button>
          </div>

          {/* Supported wallets with simple badges */}
          <div className="mt-8">
            <h2 className="text-sm font-medium text-secondary-text">Supported wallets</h2>
            <WalletBadges />
            <p className="mt-2 text-xs text-secondary-text">
              Logos are simplified placeholders. We can drop in official icons anytime.
            </p>
          </div>

          <div className="mt-8 rounded bg-background/60 p-4 border">
            <h3 className="text-sm font-medium">Why this is safe</h3>
            <p className="mt-1 text-sm text-secondary-text">{STRINGS.safetyYourKeys}</p>
            <ul className="mt-3 text-sm text-secondary-text list-disc pl-5 space-y-1">
              <li>Review and approve actions in your wallet.</li>
              <li>No custody of your funds; contracts verify permissions.</li>
              <li>Everything is recorded on-chain.</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-secondary-text">
            Not ready to connect? You can {" "}
            <Link href="/discover" className="underline hover:opacity-80">browse requests</Link>
            {" "}
            first.
          </div>
        </div>
        </Container>
      </main>
    </div>
  );
}
