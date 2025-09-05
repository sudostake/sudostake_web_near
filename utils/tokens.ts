import { getActiveNetwork, type Network } from "@/utils/networks";

export type TokenConfig = {
  id: string; // NEP-141 contract account id
  symbol: string;
  decimals: number;
  name?: string;
};

// Minimal token registry optimized for USDC today, structured for future extension.
const TOKENS_BY_NETWORK: Partial<Record<Network, Record<string, TokenConfig>>> = {
  // Known testnet USDC
  testnet: {
    "usdc.tkn.primitives.testnet": {
      id: "usdc.tkn.primitives.testnet",
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin (Testnet)",
    },
  },
  // Add mainnet mappings as they are finalized
  mainnet: {
    // "usdc.contract.near": { id: "usdc.contract.near", symbol: "USDC", decimals: 6, name: "USD Coin" },
  },
};

export function getKnownTokens(network: Network = getActiveNetwork()): TokenConfig[] {
  const byId = TOKENS_BY_NETWORK[network] ?? {};
  return Object.values(byId);
}

export function getTokenConfigById(
  tokenId: string,
  network: Network = getActiveNetwork()
): TokenConfig | undefined {
  const byId = TOKENS_BY_NETWORK[network] ?? {};
  return byId[tokenId];
}

export function getDefaultUsdcTokenId(network: Network = getActiveNetwork()): string | null {
  const known = TOKENS_BY_NETWORK[network];
  if (!known) return null;
  // Prefer a token with symbol USDC
  for (const cfg of Object.values(known)) {
    // Fast path: exact match without allocation
    if (cfg.symbol === "USDC") return cfg.id;
    const symbolUpper = cfg.symbol.toUpperCase();
    if (symbolUpper === "USDC") return cfg.id;
  }
  return null;
}

export function getTokenDecimals(tokenId: string, network: Network = getActiveNetwork()): number {
  const cfg = getTokenConfigById(tokenId, network);
  if (cfg) return cfg.decimals;
  // Default to 6 for stablecoins if unknown; callers may override in the future
  return 6;
}
