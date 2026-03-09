"use client";

import React from "react";
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
import { FlatSection } from "@/app/components/ui/FlatSection";

export default function Dashboard() {
  const { signedAccountId, blocked } = useRouteAccess("authOnly");

  const [showCreate, setShowCreate] = React.useState(false);

  // Memoize the JSON-RPC provider (same origin proxy) to avoid recreating it per render
  const activeNetwork = getActiveNetwork();
  const factoryId = React.useMemo(() => factoryContract(activeNetwork), [activeNetwork]);

  const { balances, loading: balancesLoading, refetch: refetchBalances } = useTokenBalances();
  const { data: userVaultIds } = useUserVaults(signedAccountId, factoryId);
  const { data: lenderPositions } = useLenderPositions(signedAccountId, factoryId);

  // Fetch balances on dashboard entry to show up-to-date totals.
  React.useEffect(() => {
    refetchBalances();
  }, [refetchBalances]);

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
  const workspaceTitle = tab === "vaults" ? "Manage vaults" : "Track positions";
  const workspaceCaption =
    tab === "vaults"
      ? "Open a vault to manage deposits, delegation, and request terms."
      : "Track the vaults where you currently have active lending positions.";

  if (blocked || !signedAccountId) {
    return null;
  }

  return (
    <main id="main" className="min-h-screen bg-background">
      <Container className="space-y-10 pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-foreground">Dashboard</h1>
              <p className="max-w-3xl text-sm text-secondary-text">
                Manage vaults, lender positions, and wallet balances from one workspace.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setShowCreate(true)}
                disabled={!signedAccountId}
              >
                New vault
              </Button>
            </div>
          </div>
        </header>

        <FlatSection
          title={workspaceTitle}
          caption={workspaceCaption}
          actions={
            <div className="w-full sm:min-w-[330px]">
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
          }
          contentClassName="min-h-[260px] px-4 py-5 sm:px-5 sm:py-6"
        >
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
        </FlatSection>

        <FlatSection
          title="Wallet balances"
          caption="Use available balances for transfers, deposits, and request funding."
        >
          <AccountSummary
            near={balances.near}
            usdc={balances.usdc}
            loading={balancesLoading}
            onRefreshBalances={refetchBalances}
            surface="plain"
            showHeader={false}
          />
        </FlatSection>
      </Container>
      <CreateVaultDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          // Update main account balances (NEAR/USDC) after vault creation
          refetchBalances();
        }}
      />
    </main>
  );
}
