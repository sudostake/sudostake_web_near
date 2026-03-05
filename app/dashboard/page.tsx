"use client";

import React, { useMemo } from "react";
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
import { useRouteAccess } from "@/app/hooks/useRouteAccess";

export default function Dashboard() {
  const { signedAccountId, blocked } = useRouteAccess("authOnly");

  const [showCreate, setShowCreate] = React.useState(false);

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

  if (blocked || !signedAccountId) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-34vh] h-[62vh] bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.2),transparent_67%)]"
      />
      <Container className="relative space-y-5 pt-8 sm:pt-10 lg:pt-12">
        <header className="surface-card rounded-3xl px-5 py-6 shadow-card-subtle sm:px-6 sm:py-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-[clamp(1.7rem,3.4vw,2.25rem)] font-semibold leading-[1.1] text-foreground">
                  Dashboard
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary-text">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 font-mono normal-case text-xs">
                  {shortAccount}
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1">
                  Network {networkLabel}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setShowCreate(true)}
                disabled={!signedAccountId}
              >
                Create vault
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.06fr),minmax(300px,0.94fr)]">
          <section className="surface-card rounded-3xl px-5 py-6 shadow-card-subtle sm:px-6 sm:py-7">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-semibold text-foreground">Workspace</h2>
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

              <div className="pt-2">
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
                    showCreateButton={false}
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
