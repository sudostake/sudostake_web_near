"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { AccountSummary } from "../components/AccountSummary";
import Big from "big.js";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";

// NEP-141 USDC token contract on testnet
const USDC_CONTRACT = "usdc.tkn.primitives.testnet";

export default function Dashboard() {
  const { signedAccountId, viewFunction } = useWalletSelector();
  const router = useRouter();

  const [nearBalance, setNearBalance] = useState<string>("—");
  const [usdcBalance, setUsdcBalance] = useState<string>("—");

  // If user signs out (no account), redirect to landing
  useEffect(() => {
    if (!signedAccountId) {
      router.replace("/");
    }
  }, [signedAccountId, router]);

  // Memoize the JSON-RPC provider (same origin proxy) to avoid recreating it per render
  const rpc = useMemo(
    () => new providers.JsonRpcProvider({ url: "/api/rpc" }),
    []
  );

  // Fetch balances when signed in
  useEffect(() => {
    if (!signedAccountId) return;
    rpc
      .query({
        request_type: "view_account",
        account_id: signedAccountId,
        finality: "final",
      })
    .then((value) => {
        // We assert AccountView here; consider adding a type guard to verify the response shape
        const acct = value as AccountView;
        setNearBalance(utils.format.formatNearAmount(acct.amount));
      })
      .catch((err) => {
        console.warn("NEAR balance fetch failed:", err);
        setNearBalance("—");
      });
  }, [signedAccountId, rpc]);

  useEffect(() => {
    if (!signedAccountId) return;
    viewFunction({
      contractId: USDC_CONTRACT,
      method: "ft_balance_of",
      args: { account_id: signedAccountId },
    })
      .then((raw) => {
        // Ensure the viewFunction returns a string for ft_balance_of
        if (typeof raw !== "string") {
          console.warn(
            `USDC balance expected string but got ${typeof raw}`,
            raw
          );
          setUsdcBalance("—");
          return;
        }
        const tokenRaw = raw;
        const decimals = 6;
        const human = new Big(tokenRaw)
          .div(10 ** decimals)
          .toFixed(decimals);
        setUsdcBalance(human);
      })
      .catch((err) => {
        console.warn("USDC balance fetch failed:", err);
        setUsdcBalance("—");
      });
  }, [signedAccountId, viewFunction]);

  if (!signedAccountId) {
    return null;
  }

  // Account summary component
  const summary = <AccountSummary near={nearBalance} usdc={usdcBalance} />;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {summary}
      <main className="w-full max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center">Dashboard</h1>
        <p className="mt-4 text-center text-gray-700">
          Welcome, {signedAccountId}!
        </p>
      </main>
    </div>
  );
}
