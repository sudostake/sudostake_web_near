"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getActiveFactoryId } from "@/utils/networks";
import { useVault } from "@/hooks/useVault";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { DepositDialog } from "@/app/components/dialogs/DepositDialog";
import { DelegateDialog } from "@/app/components/dialogs/DelegateDialog";
import { UndelegateDialog } from "@/app/components/dialogs/UndelegateDialog";
import { ClaimUnstakedDialog } from "@/app/components/dialogs/ClaimUnstakedDialog";
import { WithdrawDialog } from "@/app/components/dialogs/WithdrawDialog";
import { AvailableBalanceCard } from "./components/AvailableBalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { DelegationsCard } from "./components/DelegationsCard";
import { LiquidityRequestsCard } from "./components/LiquidityRequestsCard";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { NATIVE_TOKEN, NATIVE_DECIMALS } from "@/utils/constants";
import { DelegationsActionsProvider } from "./components/DelegationsActionsContext";


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

  const { loading, error, refetch } = useVault(factoryId, vaultId);
  const { balance: vaultNear, loading: vaultNearLoading, refetch: refetchVaultNear } =
    useAccountBalance(vaultId);
  

  const { balance: availBalance, loading: availLoading, refetch: refetchAvail } =
    useAvailableBalance(vaultId);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [delegateValidator, setDelegateValidator] = useState<string | null>(null);
  const [undelegateOpen, setUndelegateOpen] = useState(false);
  const [undelegateValidator, setUndelegateValidator] = useState<string | null>(null);
  const handleDeposit = () => setDepositOpen(true);
  const handleWithdraw = () => setWithdrawOpen(true);
  const handleDelegate = (validator?: string) => {
    setDelegateValidator(validator ?? null);
    setDelegateOpen(true);
  };
  const handleUndelegate = (validator: string) => {
    setUndelegateValidator(validator);
    setUndelegateOpen(true);
  };
  const resetDeposit = () => setDepositOpen(false);
  const resetWithdraw = () => setWithdrawOpen(false);
  const resetDelegate = () => {
    setDelegateValidator(null);
    setDelegateOpen(false);
  };
  const resetUndelegate = () => {
    setUndelegateValidator(null);
    setUndelegateOpen(false);
  };
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimValidator, setClaimValidator] = useState<string | null>(null);
  const handleUnclaimUnstaked = (validator: string) => {
    setClaimValidator(validator);
    setClaimOpen(true);
  };
  const resetClaim = () => {
    setClaimValidator(null);
    setClaimOpen(false);
  };

  // Delegations hook (refreshable on delegate)
  const {
    data: delegData,
    loading: delegLoading,
    error: delegError,
    refetch: refetchDeleg,
  } = useVaultDelegations(factoryId, vaultId);

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
            title={`${vaultNearLoading ? "…" : vaultNear} ${NATIVE_TOKEN}`}
            >
              {vaultNearLoading ? "…" : vaultNear}
            </span>
            <span className="text-secondary-text shrink-0">{NATIVE_TOKEN}</span>
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
    Body = (
      <div className="space-y-4 p-4">
        <AvailableBalanceCard
          balance={availBalance}
          loading={availLoading}
        />

        <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} disabled={loading || Boolean(error)} />

        {/* Delegations list & controls */}
        <DelegationsActionsProvider
          value={{
            onDeposit: handleDeposit,
            onDelegate: handleDelegate,
            onUndelegate: handleUndelegate,
            onUnclaimUnstaked: handleUnclaimUnstaked,
          }}
        >
          <DelegationsCard
            loading={delegLoading}
            error={delegError}
            summary={delegData?.summary}
            refetch={refetchDeleg}
            availableBalance={availBalance}
            availableLoading={availLoading}
          />
        </DelegationsActionsProvider>

        <LiquidityRequestsCard />
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
          symbol={NATIVE_TOKEN}
          onSuccess={() => {
            refetchVaultNear();
            refetchAvail();
            // Refresh delegations after deposit? optional
          }}
        />
        <WithdrawDialog
          open={withdrawOpen}
          onClose={resetWithdraw}
          vaultId={vaultId}
          onSuccess={() => {
            refetchVaultNear();
            refetchAvail();
            // Refresh delegations after withdrawal? optional
          }}
        />
        <DelegateDialog
          open={delegateOpen}
          onClose={resetDelegate}
          vaultId={vaultId}
          balance={availBalance}
          loading={availLoading}
          defaultValidator={delegateValidator ?? undefined}
          onSuccess={() => {
            refetchAvail();
            // Refresh delegations after delegation
            refetchDeleg();
          }}
        />
        <UndelegateDialog
          open={undelegateOpen && Boolean(undelegateValidator)}
          onClose={resetUndelegate}
          vaultId={vaultId}
          validator={undelegateValidator!}
          balance={
            new Balance(
              delegData?.summary?.find((e) => e.validator === undelegateValidator)
                ?.staked_balance.minimal ?? "0",
              NATIVE_DECIMALS,
              NATIVE_TOKEN
            )
          }
          loading={delegLoading}
          onSuccess={() => {
            refetchAvail();
            refetchDeleg();
          }}
        />
        <ClaimUnstakedDialog
          open={claimOpen}
          onClose={resetClaim}
          vaultId={vaultId}
          validator={claimValidator ?? ""}
          onSuccess={() => {
            refetchAvail();
            refetchDeleg();
          }}
        />
      </main>
    </div>
  );
}
