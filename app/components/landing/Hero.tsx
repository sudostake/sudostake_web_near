"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
import { TrustBar } from "@/app/components/landing/TrustBar";
import { SpinningTokenPair } from "@/app/components/ui/SpinningTokenPair";
import { getActiveNetwork } from "@/utils/networks";

export function Hero() {
  const { signIn } = useWalletSelector();
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
  return (
    <section className="text-center relative overflow-hidden rounded-xl border bg-surface/60">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="hero-gradient w-full h-full" />
      </div>
      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <div className="flex items-center justify-center">
          <SpinningTokenPair
            size={48}
            durationSec={14}
            ariaLabel="USDC and NEAR spinning logo"
            title="USDC and NEAR spinning logo"
            className="scale-110 md:scale-125 lg:scale-150 transition-transform"
            pauseOnHover
          />
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold">
          Borrow and Lend with NEAR‑backed Vaults
        </h1>
        <p className="mt-3 text-base sm:text-lg text-secondary-text">
          Create a vault secured by NEAR, request USDC liquidity, and let lenders earn yield — all non‑custodial and on‑chain.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => {
              setConnecting(true);
              Promise.resolve(signIn()).catch(() => setConnecting(false));
            }}
            disabled={connecting}
            aria-busy={connecting || undefined}
          >
            {connecting ? "Opening wallet…" : "Connect Wallet"}
          </Button>
          <Link href="/discover" className="inline-flex">
            <Button size="lg" variant="secondary">Explore Requests</Button>
          </Link>
          <a href="#how-it-works" className="inline-flex">
            <Button size="lg" variant="ghost">How it works</Button>
          </a>
        </div>
        {slowConnect && (
          <div className="mt-2 flex justify-center" aria-hidden>
            <div className="h-2 w-28 rounded bg-background animate-pulse" />
          </div>
        )}
        <p className="mt-3 text-xs text-secondary-text">Always review transactions in your wallet. Smart contracts carry risk.</p>
        <p className="mt-3 text-sm text-secondary-text">
          No wallet? You can browse first, then connect when ready.
        </p>
        {network && network !== "mainnet" && (
          <div className="mt-3 text-xs inline-flex items-center gap-2 rounded border bg-background/70 px-2.5 py-1.5 text-secondary-text" role="note">
            <span className="font-medium">Testnet</span>
            <span>Funds are for testing only.</span>
          </div>
        )}
        <TrustBar />
      </div>
      <style jsx>{`
        .hero-gradient {
          background: radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.25), transparent 60%),
                      radial-gradient(800px 400px at 10% 10%, rgba(16,185,129,0.18), transparent 60%),
                      radial-gradient(800px 400px at 90% 10%, rgba(139,92,246,0.18), transparent 60%);
        }
      `}</style>
    </section>
  );
}
