"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getActiveFactoryId } from "@/utils/networks";
import { useVault } from "@/hooks/useVault";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useAvailableBalance } from "@/hooks/useAvailableBalance";
import { Modal } from "@/app/components/Modal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useDeposit } from "@/hooks/useDeposit";
import { useIndexVault } from "@/hooks/useIndexVault";
import { useWithdraw } from "@/hooks/useWithdraw";
import { AvailableBalanceCard } from "./components/AvailableBalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { DetailsCard } from "./components/DetailsCard";
import { ActivitySection } from "./components/ActivitySection";
import { parseNumber } from "@/utils/format";

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
  const { balances, loading: balancesLoading } = useTokenBalances();
  const { deposit, pending: depositing, error: depositError } = useDeposit();
  const { withdraw, pending: withdrawing, error: withdrawError } = useWithdraw();
  const { indexVault } = useIndexVault();

  const { balance: availBalance, loading: availLoading, refetch: refetchAvail } =
    useAvailableBalance(vaultId);

  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const handleDeposit = () => setDepositOpen(true);
  const handleWithdraw = () => setWithdrawOpen(true);
  const resetDeposit = () => {
    setAmount("");
    setDepositOpen(false);
  };
  const resetWithdraw = () => {
    setAmount("");
    setWithdrawOpen(false);
  };

  const modalSymbol = (data?.symbol ?? "NEAR").toUpperCase();
  const availableStr = modalSymbol === "USDC" ? balances.usdc : balances.near;
  const amountNum = Number(amount);
  const depositAvailableNum = parseNumber(availableStr);
  const depositDisableContinue =
    !amount || Number.isNaN(amountNum) || amountNum <= 0 || Number.isNaN(depositAvailableNum) || amountNum > depositAvailableNum;
  const withdrawAvailableNum = parseNumber(availBalance);
  const withdrawDisableContinue =
    !amount || Number.isNaN(amountNum) || amountNum <= 0 || Number.isNaN(withdrawAvailableNum) || amountNum > withdrawAvailableNum;

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
    const owner = data?.owner ?? null;

    Body = (
      <div className="space-y-4 p-4">
        <AvailableBalanceCard
          balance={availBalance}
          loading={availLoading}
          symbol={data?.symbol}
          apy={apy}
        />

        <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} disabled={loading || Boolean(error)} />

        <DetailsCard vaultId={vaultId} owner={owner} factoryId={factoryId} />

        <ActivitySection />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-2xl mx-auto" aria-busy={loading || undefined}>
        {Header}
        {Body}
        <Modal
          open={depositOpen}
          onClose={resetDeposit}
          title="Deposit to vault"
          disableBackdropClose={depositing}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
                onClick={resetDeposit}
                disabled={depositing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={depositDisableContinue || depositing}
              onClick={async () => {
                try {
                  const { txHash } = await deposit({ vault: vaultId, amount });
                  await indexVault({ factoryId, vault: vaultId, txHash });
                } catch (err) {
                  console.warn("Deposit failed", err);
                } finally {
                  resetDeposit();
                  refetchVaultNear();
                  refetchAvail();
                }
              }}
              >
                {depositing ? "Depositing..." : "Continue"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="text-sm text-secondary-text">
              Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
            </div>
            <label className="block text-sm">
              <span className="text-secondary-text">Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0.0"
                className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            {depositError && (
              <div className="text-xs text-red-500">{depositError}</div>
            )}
            <div className="flex items-center justify-between text-xs text-secondary-text">
              <div>
                Max you can deposit: {balancesLoading ? "…" : availableStr} {modalSymbol}
              </div>
              <button
                type="button"
                className="underline disabled:no-underline disabled:opacity-60"
                disabled={balancesLoading}
              onClick={() => {
                const numeric = parseNumber(availableStr);
                setAmount(Number.isNaN(numeric) ? "" : numeric.toString());
              }}
                aria-label="Use maximum available"
              >
                Max
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          open={withdrawOpen}
          onClose={resetWithdraw}
          title="Withdraw from vault"
          disableBackdropClose={withdrawing}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded border py-2 px-3 bg-surface hover:bg-surface/90"
                onClick={resetWithdraw}
                disabled={withdrawing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-primary text-primary-text py-2 px-3 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={withdrawDisableContinue || withdrawing}
                onClick={async () => {
                  try {
                    const { txHash } = await withdraw({ vault: vaultId, amount });
                    await indexVault({ factoryId, vault: vaultId, txHash });
                  } catch (err) {
                    console.warn("Withdraw failed", err);
                  } finally {
                    resetWithdraw();
                    refetchVaultNear();
                    refetchAvail();
                  }
                }}
              >
                {withdrawing ? "Withdrawing..." : "Continue"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="text-sm text-secondary-text">
              Vault: <span className="font-medium text-foreground" title={vaultId}>{vaultId}</span>
            </div>
            <label className="block text-sm">
              <span className="text-secondary-text">Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0.0"
                className="mt-1 w-full rounded border bg-background p-2 outline-none focus:ring-2 focus:ring-primary/50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            {withdrawError && (
              <div className="text-xs text-red-500">{withdrawError}</div>
            )}
            <div className="flex items-center justify-between text-xs text-secondary-text">
              <div>
                Max you can withdraw: {availLoading ? "…" : availBalance} {modalSymbol}
              </div>
              <button
                type="button"
                className="underline disabled:no-underline disabled:opacity-60"
                disabled={availLoading}
                onClick={() => {
                  const numeric = parseNumber(availBalance);
                  setAmount(Number.isNaN(numeric) ? "" : numeric.toString());
                }}
                aria-label="Use maximum available"
              >
                Max
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
