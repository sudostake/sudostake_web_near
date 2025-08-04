"use client";
import React from "react";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import type { WalletSelectorParams, WalletModuleFactory } from "@near-wallet-selector/core";

// WalletModuleFactory is invariant in its generic; we assert here to satisfy WalletSelectorParams
const modules = [
  setupBitteWallet(),
  setupMeteorWallet(),
  setupLedger(),
  setupNightly(),
] as unknown as WalletModuleFactory[];

const walletSelectorConfig: WalletSelectorParams = {
  network: "testnet", // "mainnet"
  // Optional: createAccessKeyFor: "hello.near-examples.testnet",
  modules,
};

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletSelectorProvider config={walletSelectorConfig}>
      {children}
    </WalletSelectorProvider>
  );
}
