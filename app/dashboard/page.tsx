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

  // Tabs: vaults vs positions
  const [tab, setTab] = React.useState<string>(() => {
    if (typeof window === "undefined") return "vaults";
    const s = window.localStorage.getItem("dashboard:tab");
    return s === "positions" ? "positions" : "vaults";
  });
  React.useEffect(() => {
    try { window.localStorage.setItem("dashboard:tab", tab); } catch {}
  }, [tab]);

  if (!signedAccountId) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {summary}
      <main id="main" className="w-full max-w-2xl mx-auto mt-8">
        <div className="mb-3">
          <SegmentedToggle
            value={tab}
            onChange={setTab}
            options={[
              { id: "vaults", label: `Vaults (${userVaultIds?.length ?? 0})` },
              { id: "positions", label: `Positions (${lenderPositions?.length ?? 0})` },
            ]}
            ariaLabel="Dashboard sections"
            variant="neutral"
          />
        </div>
        {/* Tab panels with proper a11y mapping */}
        <div
          id="vaults-panel"
          role="tabpanel"
          aria-labelledby="vaults-trigger"
          hidden={tab !== "vaults"}
          className="mt-4"
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
          className="mt-4"
        >
          <LenderPositions lender={signedAccountId} factoryId={factoryId} headerMode="toolsOnly" />
        </div>
      </main>
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
