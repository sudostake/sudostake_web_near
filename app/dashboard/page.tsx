"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { AccountSummary } from "../components/AccountSummary";
import { CreateVaultDialog } from "../components/dialogs/CreateVaultDialog";
import { UserVaults } from "../components/vaults/UserVaults";
import { LenderPositions } from "../components/vaults/LenderPositions";
import { getActiveNetwork, factoryContract } from "@/utils/networks";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { shortAmount } from "@/utils/format";
import { Container } from "@/app/components/layout/Container";

export default function Dashboard() {
  const { signedAccountId } = useWalletSelector();
  const router = useRouter();

  const [showCreate, setShowCreate] = React.useState(false);

  // If user signs out (no account), redirect to landing
  useEffect(() => {
    if (!signedAccountId) {
      router.replace("/");
    }
  }, [signedAccountId, router]);

  // Memoize the JSON-RPC provider (same origin proxy) to avoid recreating it per render
  const activeNetwork = getActiveNetwork();
  const factoryId = useMemo(() => factoryContract(activeNetwork), [activeNetwork]);

  const { balances, loading: balancesLoading, refetch: refetchBalances } = useTokenBalances();

  // Always refresh balances on dashboard entry to show up-to-date totals.
  React.useEffect(() => {
    refetchBalances();
  }, [refetchBalances]);


  // Account summary component
  const summary = (
    <AccountSummary
      near={balances.near}
      usdc={balances.usdc}
      loading={balancesLoading}
      onRefreshBalances={refetchBalances}
    />
  );

  // Sticky header handling
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const sentinel = document.getElementById("dashboard-header-sentinel");
    if (!sentinel) return;
    const rootStyles = getComputedStyle(document.documentElement);
    const navVar = rootStyles.getPropertyValue("--nav-height").trim();
    const parsed = parseInt(navVar, 10);
    const navPx = Number.isFinite(parsed) ? parsed : 56;
    const rootMargin = `-${navPx}px 0px 0px 0px`;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const next = entry.intersectionRatio < 1;
      setStuck((prev) => (prev !== next ? next : prev));
    }, { threshold: [1], root: null, rootMargin });
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const nearShort = shortAmount(balances.near.toDisplay(), 5);
  const usdcShort = shortAmount(balances.usdc.toDisplay(), 2);

  if (!signedAccountId) {
    return null;
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Container>
        {/* Sticky subheader */}
        <div id="dashboard-header-sentinel" aria-hidden className="h-px" />
        <header
          className={[
            "sticky z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow",
            stuck ? "border-b border-foreground/10 shadow-sm" : "shadow-none",
          ].join(" ")}
          style={{ top: "var(--nav-height, 56px)" }}
        >
          <div className="py-2 px-3">
            <SectionHeader
              title="Dashboard"
              caption={<>{activeNetwork.charAt(0).toUpperCase() + activeNetwork.slice(1)}</>}
            />
          </div>
        </header>

        <main id="main" className="mt-4 lg:mt-6">
          {/* 12-col grid: content and side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {summary}
              <UserVaults
                owner={signedAccountId}
                factoryId={factoryId}
                onCreate={() => setShowCreate(true)}
              />
            </div>
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <LenderPositions lender={signedAccountId} factoryId={factoryId} />
            </div>
          </div>
        </main>
      </Container>

      <CreateVaultDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          // Refresh main account balances (NEAR/USDC) after vault creation
          refetchBalances();
        }}
      />
    </div>
  );
}
