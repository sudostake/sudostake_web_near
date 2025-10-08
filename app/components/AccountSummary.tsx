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
    <Card className={`w-full h-full rounded-[28px] border-white/12 bg-surface/95 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.65)] ${className}`}>
      <HeaderWithActions onRefreshBalances={onRefreshBalances} />
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
    <SectionHeader
      title="Liquid balances"
      caption="See the NEAR and USDC you can deploy into vaults or lending immediately."
      right={
        onRefreshBalances && (
          <Button size="sm" variant="secondary" onClick={() => onRefreshBalances?.()}>
            Refresh
          </Button>
        )
      }
    />
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
    <div className="rounded-2xl border border-foreground/5 bg-surface-muted/60 p-4">
      <div className="text-xs uppercase tracking-wide text-secondary-text">{label}</div>
      <div className="mt-2 flex min-w-0 items-baseline gap-1 text-3xl font-semibold">
        {loading ? (
          <div className="h-8 w-28 animate-pulse rounded-full bg-background" aria-hidden="true" />
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
