"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { AccountSummary } from "../components/AccountSummary";
import { CreateVaultDialog } from "../components/dialogs/CreateVaultDialog";
import { UserVaults } from "../components/vaults/UserVaults";
import { LenderPositions } from "../components/vaults/LenderPositions";
import { getActiveNetwork, factoryContract } from "@/utils/networks";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { SegmentedToggle } from "@/app/components/ui/SegmentedToggle";
import { useUserVaults } from "@/hooks/useUserVaults";
import { useLenderPositions } from "@/hooks/useLenderPositions";
import { Container } from "@/app/components/layout/Container";
import { Button } from "@/app/components/ui/Button";

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
  const { data: userVaultIds } = useUserVaults(signedAccountId, factoryId);
  const { data: lenderPositions } = useLenderPositions(signedAccountId, factoryId);

  // Fetch balances on dashboard entry to show up-to-date totals.
  React.useEffect(() => {
    refetchBalances();
  }, [refetchBalances]);

  // Account summary component
  const [tab, setTab] = React.useState<string>(() => {
    if (typeof window === "undefined") return "vaults";
    const s = window.localStorage.getItem("dashboard:tab");
    return s === "positions" ? "positions" : "vaults";
  });
  React.useEffect(() => {
    try { window.localStorage.setItem("dashboard:tab", tab); } catch {}
  }, [tab]);

  const totalVaults = userVaultIds?.length ?? 0;
  const totalPositions = lenderPositions?.length ?? 0;
  const networkLabel = `${activeNetwork.charAt(0).toUpperCase()}${activeNetwork.slice(1)}`;

  const shortAccount = React.useMemo(() => {
    if (!signedAccountId) return "";
    if (signedAccountId.length <= 26) return signedAccountId;
    return `${signedAccountId.slice(0, 10)}…${signedAccountId.slice(-8)}`;
  }, [signedAccountId]);

  const tabCopy =
    tab === "positions"
      ? "Monitor every position you’ve funded, from repayment progress to liquidation status, without leaving the dashboard."
      : "Publish requests, manage collateral actions, and track health for each vault you operate.";

  if (!signedAccountId) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-30vh] h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.18),transparent_65%)]"
      />
      <Container className="relative pt-24 space-y-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.58fr),minmax(280px,0.42fr)]">
          <header className="relative overflow-hidden rounded-[32px] border border-white/12 bg-surface/90 px-6 py-8 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.65)] backdrop-blur-sm sm:px-10">
            <div
              aria-hidden="true"
              className="absolute -right-24 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.2),transparent_70%)] blur-3xl"
            />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Dashboard</p>
                <h1 className="text-[clamp(2.1rem,4.2vw,2.8rem)] font-semibold text-foreground">
                  Operate your NEAR credit line
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-secondary-text sm:text-sm">
                  Monitor balances, collateral health, and active lending positions in one place. Every control stays linked to
                  the vault you own.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-text">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-background/80 px-3 py-1 font-mono text-xs text-secondary-text/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse-soft" aria-hidden="true" />
                  {shortAccount}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Network: {networkLabel}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <HeaderStat label="Vaults you own" value={totalVaults} />
                <HeaderStat label="Active lending positions" value={totalPositions} />
              </div>
              <div>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  Create new vault
                </Button>
              </div>
            </div>
          </header>
          <AccountSummary
            near={balances.near}
            usdc={balances.usdc}
            loading={balancesLoading}
            onRefreshBalances={refetchBalances}
            className="sm:p-7"
          />
        </div>
        <section className="rounded-[32px] border border-white/12 bg-surface/95 px-6 py-8 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.6)] sm:px-10">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Operations</p>
              <h2 className="text-[clamp(1.7rem,2.8vw,2.1rem)] font-semibold text-foreground">
                Manage your positions
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-secondary-text sm:text-sm">{tabCopy}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <SegmentedToggle
                value={tab}
                onChange={setTab}
                options={[
                  { id: "vaults", label: `Vaults (${totalVaults})` },
                  { id: "positions", label: `Positions (${totalPositions})` },
                ]}
                ariaLabel="Dashboard sections"
                variant="primary"
                className="w-full max-w-md"
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/85 px-3 py-4 sm:px-6 sm:py-6">
              <div
                id="vaults-panel"
                role="tabpanel"
                aria-labelledby="vaults-trigger"
                hidden={tab !== "vaults"}
              >
                <UserVaults
                  owner={signedAccountId}
                  factoryId={factoryId}
                  onCreate={() => setShowCreate(true)}
                  headerMode="toolsOnly"
                />
              </div>
              <div
                id="positions-panel"
                role="tabpanel"
                aria-labelledby="positions-trigger"
                hidden={tab !== "positions"}
              >
                <LenderPositions lender={signedAccountId} factoryId={factoryId} headerMode="toolsOnly" />
              </div>
            </div>
          </div>
        </section>
      </Container>
      <CreateVaultDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
        // Update main account balances (NEAR/USDC) after vault creation
          refetchBalances();
        }}
      />
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-background/80 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-secondary-text/80">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
