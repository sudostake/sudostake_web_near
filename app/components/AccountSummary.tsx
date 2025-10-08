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
import { SectionHeader } from "@/app/components/ui/SectionHeader";
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

  return (
    <Card
      className={`w-full h-full rounded-3xl border-white/10 bg-surface px-6 py-6 shadow-[0_16px_52px_-32px_rgba(15,23,42,0.55)] sm:px-8 sm:py-8 ${className}`}
    >
      <HeaderWithActions onRefreshBalances={onRefreshBalances} />
      <div className="mt-5 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        <BalanceStat
          label={`${near.symbol} balance`}
          valueDisplay={nearShort}
          valueFull={near.toDisplay()}
          symbol={near.symbol}
          loading={Boolean(loading)}
        />
        <BalanceStat
          label={usdcLabel}
          valueDisplay={usdcShort}
          valueFull={usdc.toDisplay()}
          symbol={usdc.symbol}
          loading={Boolean(loading)}
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end px-4 sm:px-5">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setRecvOpen(true)}>
            Receive
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setSendOpen(true)}>
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
    </Card>
  );
}

function HeaderWithActions({ onRefreshBalances }: { onRefreshBalances?: () => void }) {
  return (
    <div className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Liquid balances</h2>
        <p className="text-sm text-secondary-text">Balances ready for deposits, transfers, or lender actions.</p>
      </div>
      {onRefreshBalances && (
        <Button size="sm" variant="secondary" onClick={() => onRefreshBalances?.()}>
          Refresh
        </Button>
      )}
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
    <div className="rounded-xl border border-white/10 bg-surface-muted/70 p-4 sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-secondary-text/80">{label}</div>
      <div className="mt-2 flex min-w-0 items-baseline gap-1 text-[2.15rem] font-semibold leading-none">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded-full bg-surface" aria-hidden="true" />
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
