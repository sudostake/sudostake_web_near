"use client";
import React from "react";
import type { WalletSelectorParams } from "@near-wallet-selector/core";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";

const walletSelectorConfig = {
  network: "testnet", // "mainnet"
  // Optional: createAccessKeyFor: "hello.near-examples.testnet",
  modules: [
    setupBitteWallet(),
    setupMeteorWallet(),
    setupLedger(),
    setupNightly(),
  ],
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
