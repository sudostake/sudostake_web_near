"use client";

import React from "react";
import Link from "next/link";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Button } from "@/app/components/ui/Button";
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
    <section className="mt-6 md:mt-8 text-center relative overflow-hidden rounded-xl border bg-surface/60">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="hero-gradient w-full h-full" />
      </div>
      <div className="relative mx-auto max-w-3xl lg:max-w-4xl px-4 py-10 sm:py-12">
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
        <h1 className="mt-4 font-semibold leading-tight text-[clamp(2rem,5vw,3rem)]">
          Stake. Earn. Trade.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-secondary-text leading-relaxed max-w-[65ch] mx-auto">
          Earn from staking, trade anytime.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            className="w-full sm:w-auto"
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
          <div className="flex flex-col gap-3 justify-center md:flex-row sm:justify-start">
            <Link href="/discover" className="flex-none w-full md:w-auto">
              <Button size="lg" variant="secondary" className="w-full md:w-auto whitespace-nowrap">
                Explore Requests
              </Button>
            </Link>
            {/* Removed "How it works" button per request */}
          </div>
        </div>
        {slowConnect && (
          <div className="mt-2 flex justify-center" aria-hidden>
            <div className="h-2 w-28 rounded bg-background animate-pulse" />
          </div>
        )}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-secondary-text">Always review transactions in your wallet. Smart contracts carry risk.</p>
          <p className="text-sm text-secondary-text">No wallet? Browse first, then connect when ready.</p>
          {network && network !== "mainnet" && (
            <div
              className="text-xs inline-flex items-center gap-2 rounded border bg-background/70 px-2.5 py-1.5 text-secondary-text"
              role="note"
              aria-label={`Network is ${network.charAt(0).toUpperCase() + network.slice(1)}; funds are for testing only`}
            >
              <span>{network.charAt(0).toUpperCase() + network.slice(1)} — funds are for testing only.</span>
            </div>
          )}
        </div>
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
