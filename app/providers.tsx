"use client";
import "@near-wallet-selector/modal-ui/styles.css";
import React from "react";
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import type { WalletSelectorParams, WalletModuleFactory } from "@near-wallet-selector/core";
import { getActiveNetwork, rpcPath, rpcUpstream } from "../utils/networks";

// WalletModuleFactory is invariant in its generic; we assert here to satisfy WalletSelectorParams
const modules = [
  setupBitteWallet(),
  setupMeteorWallet(),
  setupMyNearWallet(),
  setupLedger(),
  setupNightly(),
] as unknown as WalletModuleFactory[];

const activeNetwork = getActiveNetwork();

const walletSelectorConfig: WalletSelectorParams = {
  // Use API proxy for nodeUrl (avoids CORS) and direct upstream for indexer
  network: {
    networkId: activeNetwork,
    nodeUrl: rpcPath(activeNetwork),
    helperUrl: `https://helper.${activeNetwork}.near.org`,
    explorerUrl: `https://explorer.${activeNetwork}.near.org`,
    indexerUrl: rpcUpstream(activeNetwork),
  },
  fallbackRpcUrls: [rpcPath(activeNetwork)],
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
