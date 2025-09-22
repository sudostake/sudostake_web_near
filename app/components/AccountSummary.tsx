"use client";
import React from "react";
// import { useWalletSelector } from "@near-wallet-selector/react-hook";

import { Balance } from "@/utils/balance";
import { getActiveNetwork } from "@/utils/networks";
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
  const network = getActiveNetwork();
  const usdcLabel = network === "mainnet" ? "USDC" : "USDC (Testnet)";
  const nearShort = shortAmount(near.toDisplay(), 5);
  const usdcShort = shortAmount(usdc.toDisplay(), 2);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [recvOpen, setRecvOpen] = React.useState(false);

  return (
    <Card className="w-full md:max-w-2xl md:mx-auto p-4">
      <HeaderWithActions onRefreshBalances={onRefreshBalances} />
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

function HeaderWithActions({ onRefreshBalances }: { onRefreshBalances?: () => void }) {
  const network = getActiveNetwork();

  function RefreshIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M4 4v4h.01h4a1 1 0 1 0 0-2H7.414A5.002 5.002 0 0 1 15 10a5 5 0 0 1-9.584 2H3.26A7 7 0 1 0 17 10a7.002 7.002 0 0 0-6.76-7H10a1 1 0 1 0 0 2h.24A5 5 0 0 1 15 10a5 5 0 1 1-9.584-2H8a1 1 0 1 0 0-2H4Z" />
      </svg>
    );
  }

  return (
    <>
      <SectionHeader
        title="Account Balances"
        caption={<span className="uppercase text-xs">{network}</span>}
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onRefreshBalances?.()} title="Refresh balances" aria-label="Refresh balances" className="px-2">
              <RefreshIcon />
            </Button>
          </div>
        }
      />
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
