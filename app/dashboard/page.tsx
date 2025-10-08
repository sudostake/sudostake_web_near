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
      <Container className="relative space-y-8 pt-14 sm:space-y-10 sm:pt-[4.5rem]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.58fr),minmax(280px,0.42fr)]">
          <header className="rounded-3xl border border-white/10 bg-surface px-6 py-6 shadow-[0_16px_52px_-30px_rgba(15,23,42,0.55)] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse-soft" aria-hidden="true" />
                  Dashboard overview
                </div>
                <div className="space-y-2">
                  <h1 className="text-[clamp(1.85rem,3.6vw,2.45rem)] font-semibold leading-[1.15] text-foreground">
                    Operate your NEAR credit line
                  </h1>
                  <p className="max-w-xl text-sm leading-relaxed text-secondary-text">
                    Keep your vaults funded, track lending activity, and act on liquidation tasks from one streamlined console.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-secondary-text/70">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/80 px-3 py-1 font-mono text-[11px] text-secondary-text/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse-soft" aria-hidden="true" />
                    {shortAccount}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Network: {networkLabel}</span>
                </div>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-surface-muted/70 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <HeaderStat label="Vaults you own" value={totalVaults} />
                  <HeaderStat label="Active lending positions" value={totalPositions} />
                </div>
                <p className="text-xs leading-relaxed text-secondary-text/80">
                  Manage existing vaults or open new ones in the operations hub below.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setShowCreate(true)}
                  disabled={!signedAccountId}
                >
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
          />
        </div>
        <section className="rounded-3xl border border-white/10 bg-surface px-6 py-7 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.55)] sm:px-8 sm:py-8">
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
            <div className="space-y-6 border-t border-white/10 pt-6">
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
    <div className="flex min-h-[112px] flex-col justify-between rounded-xl border border-white/10 bg-surface-muted/70 px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-text/70 leading-[1.35]">
        {label}
      </p>
      <p className="text-[1.75rem] font-semibold leading-none text-foreground">{value}</p>
    </div>
  );
}
