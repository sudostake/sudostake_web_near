"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
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

  // If user signs out (no account), redirect to login
  useEffect(() => {
    if (!signedAccountId) {
      router.replace("/login");
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
      ? "Track every funded vault, from repayment progress to liquidation risk."
      : "Create vaults, open requests, and keep collateral actions under control.";
  const activeTabLabel = tab === "positions" ? "Lender positions" : "Owner vaults";

  if (!signedAccountId) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-34vh] h-[62vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.2),transparent_67%)]"
      />
      <Container className="relative space-y-5 pt-8 sm:pt-10 lg:pt-12">
        <header className="surface-card rounded-3xl px-5 py-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.55)] sm:px-6 sm:py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse-soft" aria-hidden="true" />
                Dashboard operations
              </div>
              <div className="space-y-2">
                <h1 className="text-[clamp(1.7rem,3.4vw,2.25rem)] font-semibold leading-[1.1] text-foreground">
                  Control vaults and lender positions
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
                  Execute borrower and lender workflows from one compact console.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-secondary-text">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 font-mono normal-case text-xs">
                  {shortAccount}
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1">
                  Network {networkLabel}
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1">
                  Active {activeTabLabel}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[260px]">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setShowCreate(true)}
                disabled={!signedAccountId}
              >
                Create new vault
              </Button>
              <Link href="/discover" className="w-full">
                <Button variant="secondary" size="md" className="w-full">
                  Browse open requests
                </Button>
              </Link>
              <Link href="/docs/guides/opening-liquidity-request" className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Borrower guide
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <HeaderStat label="Vaults owned" value={totalVaults} />
            <HeaderStat label="Lender positions" value={totalPositions} />
            <HeaderStat label="Active view" value={tab === "positions" ? "Positions" : "Vaults"} />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.06fr),minmax(300px,0.94fr)]">
          <section className="surface-card rounded-3xl px-5 py-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.55)] sm:px-6 sm:py-7">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Workspace</p>
                  <h2 className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-semibold text-foreground">Manage positions</h2>
                  <p className="text-sm leading-relaxed text-secondary-text">{tabCopy}</p>
                </div>
                <div className="w-full sm:w-auto sm:min-w-[330px]">
                  <SegmentedToggle
                    value={tab}
                    onChange={setTab}
                    options={[
                      { id: "vaults", label: `Vaults (${totalVaults})` },
                      { id: "positions", label: `Positions (${totalPositions})` },
                    ]}
                    ariaLabel="Dashboard sections"
                    variant="primary"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="border-t border-[color:var(--border)] pt-4">
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

          <AccountSummary
            near={balances.near}
            usdc={balances.usdc}
            loading={balancesLoading}
            onRefreshBalances={refetchBalances}
          />
        </div>
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

function HeaderStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-3 sm:px-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-secondary-text">{label}</p>
      <p className="mt-2 text-[1.35rem] font-semibold leading-none text-foreground">{value}</p>
    </div>
  );
}
