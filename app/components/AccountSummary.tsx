"use client";
import React from "react";
// import { useWalletSelector } from "@near-wallet-selector/react-hook";

import { Balance } from "@/utils/balance";
// import { getActiveNetwork } from "@/utils/networks";
import { Card } from "@/app/components/ui/Card";
import { shortAmount } from "@/utils/format";
import { Button } from "@/app/components/ui/Button";
import { SendValueDialog } from "@/app/components/dialogs/SendValueDialog";
import { ReceiveValueDialog } from "@/app/components/dialogs/ReceiveValueDialog";
import { AddValueDialog } from "@/app/components/dialogs/AddValueDialog";
// (No asset toggle here; dialogs handle asset selection themselves)

type AccountSummaryProps = {
  near: Balance;
  usdc: Balance;
  loading?: boolean;
  onRefreshBalances?: () => void;
  className?: string;
};

export function AccountSummary({
  near,
  usdc,
  loading,
  onRefreshBalances,
  className = "",
}: AccountSummaryProps) {
  const usdcLabel = "USDC Balance";
  const nearShort = shortAmount(near.toDisplay(), 3);
  const usdcShort = shortAmount(usdc.toDisplay(), 3);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [recvOpen, setRecvOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const isLoading = Boolean(loading);

  return (
    <Card
      className={`surface-card h-full w-full rounded-3xl px-5 py-6 shadow-card-subtle sm:px-6 sm:py-7 ${className}`}
    >
      <HeaderWithActions loading={isLoading} onRefreshBalances={onRefreshBalances} />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <BalanceStat
          label={`${near.symbol} balance`}
          valueDisplay={nearShort}
          valueFull={near.toDisplay()}
          symbol={near.symbol}
          loading={isLoading}
        />
        <BalanceStat
          label={usdcLabel}
          valueDisplay={usdcShort}
          valueFull={usdc.toDisplay()}
          symbol={usdc.symbol}
          loading={isLoading}
        />
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => setRecvOpen(true)}>
            Receive
          </Button>
          <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            Add
          </Button>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setSendOpen(true)}>
            Send
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <SendValueDialog
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSuccess={() => onRefreshBalances?.()}
      />
      <ReceiveValueDialog open={recvOpen} onClose={() => setRecvOpen(false)} />
      <AddValueDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </Card>
  );
}

function HeaderWithActions({
  loading,
  onRefreshBalances,
}: {
  loading: boolean;
  onRefreshBalances?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Wallet balances</h2>
        <p className="text-sm text-secondary-text">Ready for transfers, deposits, and funding.</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onRefreshBalances?.()}
        disabled={!onRefreshBalances || loading}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}

function BalanceStat({
  label,
  valueDisplay,
  valueFull,
  symbol,
  loading,
}: {
  label: string;
  valueDisplay: string;
  valueFull: string;
  symbol: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text">{label}</div>
      <div className="mt-2 flex min-w-0 items-baseline gap-1 text-[1.7rem] font-semibold leading-none">
        {loading ? (
          <div className="h-7 w-24 animate-pulse rounded-full bg-surface" aria-hidden="true" />
        ) : (
          <>
            <span className="break-all tabular-nums" title={`${valueFull} ${symbol}`}>
              {valueDisplay}
            </span>
            <span className="shrink-0 text-sm text-secondary-text">{symbol}</span>
          </>
        )}
      </div>
    </div>
  );
}
