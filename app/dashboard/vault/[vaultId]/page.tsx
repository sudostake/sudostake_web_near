"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getActiveFactoryId } from "@/utils/networks";
import { useVault } from "@/hooks/useVault";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { DepositDialog } from "@/app/components/dialogs/DepositDialog";
import { WithdrawDialog } from "@/app/components/dialogs/WithdrawDialog";
import { AvailableBalanceCard } from "./components/AvailableBalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { DelegationsCard } from "./components/DelegationsCard";

type VaultData = {
  total?: number;
  symbol?: string;
  apy?: number | null;
  owner?: string | null;
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="inline-flex items-center justify-center h-10 w-10 rounded bg-surface hover:bg-surface/90"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  );
}

export default function VaultPage() {
  const router = useRouter();
  const { vaultId } = useParams<{ vaultId: string }>();
  const factoryId = useMemo(() => getActiveFactoryId(), []);

  const { data, loading, error, refetch } = useVault<VaultData>(factoryId, vaultId);
  const { balance: vaultNear, loading: vaultNearLoading, refetch: refetchVaultNear } =
    useAccountBalance(vaultId);
  

  const { balance: availBalance, loading: availLoading, refetch: refetchAvail } =
    useAvailableBalance(vaultId);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const handleDeposit = () => setDepositOpen(true);
  const handleWithdraw = () => setWithdrawOpen(true);
  const resetDeposit = () => setDepositOpen(false);
  const resetWithdraw = () => setWithdrawOpen(false);

  const Header = (
    <header className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:rounded">
      <div className="flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <div className="min-w-0">
          <div className="text-sm text-secondary-text">Vault</div>
          <h1 className="text-lg font-semibold truncate">{vaultId}</h1>
          <div className="text-sm text-secondary-text flex items-baseline gap-1 min-w-0">
            <span className="shrink-0">Contract Balance:</span>
            <span
              className="truncate"
              title={`${vaultNearLoading ? "…" : vaultNear} NEAR`}
            >
              {vaultNearLoading ? "…" : vaultNear}
            </span>
            <span className="text-secondary-text shrink-0">NEAR</span>
          </div>
        </div>
      </div>
    </header>
  );

  let Body: React.ReactNode;
  if (error) {
    Body = (
      <div className="p-4 text-center text-sm text-red-500" role="alert" aria-live="polite">
        Failed to load vault.
        <div className="mt-1 text-xs opacity-80">{error}</div>
        <button className="underline mt-2" onClick={refetch}>Retry</button>
      </div>
    );
  } else if (loading) {
    Body = (
      <div className="animate-pulse space-y-3 p-4" aria-live="polite" aria-busy="true">
        <div className="h-6 bg-surface rounded w-1/3" />
        <div className="h-24 bg-surface rounded" />
        <div className="h-6 bg-surface rounded w-1/2" />
        <div className="h-32 bg-surface rounded" />
      </div>
    );
  } else {
    const apy = data?.apy ?? null;

    Body = (
      <div className="space-y-4 p-4">
        <AvailableBalanceCard
          balance={availBalance}
          loading={availLoading}
          symbol={data?.symbol}
          apy={apy}
        />

        <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} disabled={loading || Boolean(error)} />

        <DelegationsCard
          factoryId={factoryId}
          vaultId={vaultId}
          onDeposit={handleDeposit}
          onDelegate={() => { console.log("Start delegating clicked"); }}
          availableBalance={availBalance}
          availableLoading={availLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-2xl mx-auto" aria-busy={loading || undefined}>
        {Header}
        {Body}
        <DepositDialog
          open={depositOpen}
          onClose={resetDeposit}
          vaultId={vaultId}
          symbol={data?.symbol}
          onSuccess={() => {
            refetchVaultNear();
            refetchAvail();
          }}
        />
        <WithdrawDialog
          open={withdrawOpen}
          onClose={resetWithdraw}
          vaultId={vaultId}
          symbol={data?.symbol}
          onSuccess={() => {
            refetchVaultNear();
            refetchAvail();
          }}
        />
      </main>
    </div>
  );
}
