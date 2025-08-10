"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { AccountSummary } from "../components/AccountSummary";
import { CreateVaultModal } from "../components/CreateVaultModal";
import { UserVaults } from "../components/vaults/UserVaults";
import { getActiveNetwork, factoryContract } from "@/utils/networks";
import { useTokenBalances } from "@/hooks/useTokenBalances";

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

  const { balances } = useTokenBalances();

  if (!signedAccountId) {
    return null;
  }

  // Account summary component
  const summary = <AccountSummary near={balances.near} usdc={balances.usdc} />;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {summary}
      <main className="w-full max-w-2xl mx-auto mt-8">
        {/* Vault listing for the connected user under the chosen factory */}
        <div className="mt-4">
          <UserVaults
            owner={signedAccountId}
            factoryId={factoryId}
            onCreate={() => setShowCreate(true)}
          />
        </div>
      </main>
      <CreateVaultModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
