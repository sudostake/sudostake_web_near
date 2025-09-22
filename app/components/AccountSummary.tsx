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

export function AccountSummary({
  near,
  usdc,
  loading,
  onRefreshBalances,
}: {
  near: Balance;
  usdc: Balance;
  loading?: boolean;
  onRefreshBalances?: () => void;
}) {
  const usdcLabel = "USDC";
  const nearShort = shortAmount(near.toDisplay(), 5);
  const usdcShort = shortAmount(usdc.toDisplay(), 2);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [recvOpen, setRecvOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  return (
    <Card className="w-full md:max-w-2xl md:mx-auto p-4">
      <HeaderWithActions />
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NEAR */}
        <BalanceStat
          label={`${near.symbol} Balance`}
          valueDisplay={nearShort}
          valueFull={near.toDisplay()}
          symbol={near.symbol}
          loading={Boolean(loading)}
        />
        {/* USDC */}
        <BalanceStat
          label={usdcLabel}
          valueDisplay={usdcShort}
          valueFull={usdc.toDisplay()}
          symbol={usdc.symbol}
          loading={Boolean(loading)}
        />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs text-secondary-text">Always review transactions in your wallet.</div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => { setRefreshing(true); onRefreshBalances?.(); window.setTimeout(() => setRefreshing(false), 600); }}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setRecvOpen(true)}>Receive</Button>
          <Button className="w-full sm:w-auto" onClick={() => setSendOpen(true)}>Send</Button>
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

function HeaderWithActions() {

  return (
    <>
      <SectionHeader title="Account Balances" />
    </>
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
    <div>
      <div className="text-xs text-secondary-text">{label}</div>
      <div className="mt-1 text-2xl font-semibold flex items-baseline gap-1 min-w-0">
        {loading ? (
          <div className="h-7 w-28 rounded bg-background animate-pulse" aria-hidden />
        ) : (
          <>
            <span className="truncate tabular-nums" title={`${valueFull} ${symbol}`}>{valueDisplay}</span>
            <span className="text-base text-secondary-text shrink-0">{symbol}</span>
          </>
        )}
      </div>
    </div>
  );
}
