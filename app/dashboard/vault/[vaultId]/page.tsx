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
import { TransferOwnershipDialog } from "@/app/components/dialogs/TransferOwnershipDialog";
import { AvailableBalanceCard } from "./components/AvailableBalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { DelegationsCard } from "./components/DelegationsCard";
import { LiquidityRequestsCard } from "./components/LiquidityRequestsCard";
import { useVaultDelegations } from "@/hooks/useVaultDelegations";
import { Balance } from "@/utils/balance";
import { NATIVE_TOKEN, NATIVE_DECIMALS } from "@/utils/constants";
import { DelegationsActionsProvider } from "./components/DelegationsActionsContext";
import { useViewerRole } from "@/hooks/useViewerRole";
import { useAccountFtBalance } from "@/hooks/useAccountFtBalance";
import { getDefaultUsdcTokenId } from "@/utils/tokens";
import { networkFromFactoryId } from "@/utils/api/rpcClient";
import { showToast } from "@/utils/toast";
import { STRINGS } from "@/utils/strings";
import { useRefundEntries } from "@/hooks/useRefundEntries";
import { Container } from "@/app/components/layout/Container";
import { VaultHeader } from "./components/VaultHeader";
import { ErrorMessage } from "@/app/components/vaults/ErrorMessage";
import { Card } from "@/app/components/ui/Card";


export default function VaultPage() {
  const router = useRouter();
  const { vaultId } = useParams<{ vaultId: string }>();
  const factoryId = useMemo(() => getActiveFactoryId(), []);
  const network = useMemo(() => networkFromFactoryId(factoryId), [factoryId]);

  const { data, loading, error, refetch } = useVault(factoryId, vaultId);
  const { isOwner } = useViewerRole(factoryId, vaultId);
  const { balance: vaultNear, loading: vaultNearLoading, refetch: refetchVaultNear } =
    useAccountBalance(vaultId);
  

  const { balance: availBalance, loading: availLoading, refetch: refetchAvail } =
    useAvailableBalance(vaultId);

  const { count: refundCount, loading: refundsLoading, refetch: refetchRefunds } = useRefundEntries(vaultId);

  // Vault USDC balance for display when funded
  const usdcId = useMemo(() => getDefaultUsdcTokenId(network), [network]);
  const { balance: vaultUsdc, loading: vaultUsdcLoading, refetch: refetchVaultUsdc } = useAccountFtBalance(vaultId, usdcId, "USDC");
  React.useEffect(() => {
    // When accepted_offer changes (after indexing), refetch USDC balance
    if (!usdcId) return;
    if (data?.accepted_offer) {
      refetchVaultUsdc();
    }
  }, [data?.accepted_offer, refetchVaultUsdc, usdcId]);

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [delegateValidator, setDelegateValidator] = useState<string | null>(null);
  const [undelegateOpen, setUndelegateOpen] = useState(false);
  const [undelegateValidator, setUndelegateValidator] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const handleDeposit = () => setDepositOpen(true);
  // Withdraw is now available in broader cases; dialog enforces precise rules per token.
  const withdrawBlockReason = useMemo(() => {
    // Optionally block if there are pending refunds; contract enforces this as well
    if ((refundCount ?? 0) > 0) return STRINGS.pendingRefunds;
    return null;
  }, [refundCount]);

  const handleWithdraw = () => {
    if (withdrawBlockReason) {
      showToast(withdrawBlockReason, { variant: "info" });
      return;
    }
    setWithdrawOpen(true);
  };
  const handleTransfer = () => {
    setTransferOpen(true);
  };
  const handleDelegate = (validator?: string) => {
    if (data?.liquidation) {
      showToast(STRINGS.delegateDisabledLiquidation, { variant: "info" });
      return;
    }
    if ((refundCount ?? 0) > 0) {
      showToast(STRINGS.delegateDisabledRefunds, { variant: "info" });
      return;
    }
    setDelegateValidator(validator ?? null);
    setDelegateOpen(true);
  };
  const handleUndelegate = (validator: string) => {
    if (data?.liquidation) {
      showToast(STRINGS.undelegateDisabledLiquidation, { variant: "info" });
      return;
    }
    if (data?.state === "pending") {
      showToast(STRINGS.undelegateDisabledPending, { variant: "info" });
      return;
    }
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
    if (data?.liquidation) {
      showToast(STRINGS.claimDisabledLiquidation, { variant: "info" });
      return;
    }
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

  // Debounced refresher for updates triggered by liquidation start/continue
  const PROCESS_REFRESH_DEBOUNCE_MS = 400;
  const processRefreshTimer = React.useRef<number | null>(null);
  const debouncedProcessRefresh = React.useCallback(() => {
    if (processRefreshTimer.current !== null) {
      window.clearTimeout(processRefreshTimer.current);
    }
    processRefreshTimer.current = window.setTimeout(() => {
      refetchAvail();
      refetchDeleg();
      processRefreshTimer.current = null;
    }, PROCESS_REFRESH_DEBOUNCE_MS);
  }, [refetchAvail, refetchDeleg]);
  React.useEffect(() => {
    return () => {
      if (processRefreshTimer.current !== null) {
        window.clearTimeout(processRefreshTimer.current);
        processRefreshTimer.current = null;
      }
    };
  }, []);

  const vaultShortName = useMemo(() => (typeof vaultId === "string" ? vaultId.split(".")[0] : String(vaultId)), [vaultId]);
  let Body: React.ReactNode;
  if (error) {
    Body = <ErrorMessage message={error} onRetry={refetch} />;
  } else if (loading) {
    Body = (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-[28px] border border-white/12 bg-surface/90 px-6 py-6 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.6)]"
          >
            <div className="h-4 w-1/3 rounded-full bg-foreground/10" />
            <div className="mt-4 h-20 rounded-2xl bg-foreground/5" />
          </div>
        ))}
      </div>
    );
  } else {
    Body = (
      <div className="space-y-6">
        <AvailableBalanceCard
          balance={availBalance}
          loading={availLoading}
        />

        {isOwner && (
          <Card className="space-y-4 rounded-[28px] border-white/12 bg-surface/95 px-6 py-6 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.6)]">
            <h2 className="text-lg font-semibold">Manage vault funds</h2>
            <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} onTransfer={handleTransfer} disabled={loading || Boolean(error)} />
          </Card>
        )}

        {/* Delegations list & controls */}
        <DelegationsActionsProvider
          value={
            isOwner
              ? {
                  onDeposit: handleDeposit,
                  onDelegate: handleDelegate,
                  onUndelegate: data?.liquidation || data?.state === "pending" ? undefined : handleUndelegate,
                  // Do not allow claiming unstaked during liquidation
                  onUnclaimUnstaked: data?.liquidation ? undefined : handleUnclaimUnstaked,
                }
              : {}
          }
        >
          <DelegationsCard
            loading={delegLoading}
            error={delegError}
            summary={delegData?.summary}
            availableBalance={availBalance}
            availableLoading={availLoading}
            refundsCount={refundCount}
            refundsLoading={refundsLoading}
            showClaimDisabledNote={isOwner && Boolean(data?.liquidation)}
          />
        </DelegationsActionsProvider>

        <LiquidityRequestsCard
          vaultId={vaultId}
          factoryId={factoryId}
          onAfterAccept={() => {
            refetchVaultUsdc();
          }}
          onAfterRepay={() => {
            refetchVaultUsdc();
            refetchAvail();
            refetchDeleg();
          }}
          onAfterTopUp={() => {
            refetchVaultUsdc();
          }}
          onAfterProcess={debouncedProcessRefresh}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-32vh] h-[62vh] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.22),transparent_65%)]"
      />
      <main id="main" className="relative w-full" aria-busy={loading || undefined}>
        <Container className="pt-20 space-y-8">
          <VaultHeader
            onBack={() => router.back()}
            vaultId={String(vaultId)}
            vaultShortName={vaultShortName}
            network={network}
            owner={data?.owner}
            vaultNear={vaultNear}
            vaultNearLoading={vaultNearLoading}
            usdcDisplay={vaultUsdc?.toDisplay()}
            vaultUsdcLoading={vaultUsdcLoading}
            state={data?.state}
            liquidation={Boolean(data?.liquidation)}
          />
          {Body}
        </Container>
        {isOwner && (
          <>
            <DepositDialog
              open={depositOpen}
              onClose={resetDeposit}
              vaultId={vaultId}
              symbol={NATIVE_TOKEN}
              onSuccess={() => {
                refetchVaultNear();
                refetchAvail();
                refetchVaultUsdc();
              }}
            />
            <TransferOwnershipDialog
              open={transferOpen}
              onClose={() => setTransferOpen(false)}
              vaultId={vaultId}
              currentOwner={data?.owner ?? null}
              onSuccess={() => {
                refetch();
              }}
            />
            <WithdrawDialog
              open={withdrawOpen}
              onClose={resetWithdraw}
              vaultId={vaultId}
              state={data?.state as "idle" | "pending" | "active" | undefined}
              requestToken={data?.liquidity_request?.token as string | undefined}
              liquidationActive={Boolean(data?.liquidation)}
              refundsCount={refundCount}
              onSuccess={() => {
                refetchVaultNear();
                refetchAvail();
                refetchVaultUsdc();
                refetchRefunds();
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
                refetchVaultNear();
                refetchAvail();
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
                refetchVaultNear();
                refetchAvail();
                refetchDeleg();
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
