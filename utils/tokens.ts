import { getActiveNetwork, type Network } from "@/utils/networks";

// Implicit account for USDC on NEAR mainnet.
// In the NEAR ecosystem, an "implicit account" is a special type of account whose
// address is a 64-character hex-encoded public key (rather than a human-readable name).
// These accounts are typically used for contracts deployed without a named account and
// are controlled by the holder of the corresponding private key.
// See: https://docs.near.org/concepts/basics/account#implicit-accounts
//
const DEFAULT_USDC_MAINNET_ID = "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1";
const DEFAULT_USDC_TESTNET_ID =
  "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af";

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
    [DEFAULT_USDC_TESTNET_ID]: {
      id: DEFAULT_USDC_TESTNET_ID,
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin (Testnet)",
    },
  },
  // Add mainnet mappings as they are finalized
  mainnet: {
    // From sudostake_agent_near/agent/src/token_registry.py
    // USDC token on NEAR mainnet (implicit account). See also:
    // - https://github.com/near/near-discovery-token-registry/blob/main/mainnet.json
    // - https://github.com/sudostake/sudostake_agent_near/blob/main/agent/src/token_registry.py
    [DEFAULT_USDC_MAINNET_ID]: {
      id: DEFAULT_USDC_MAINNET_ID,
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin",
    },
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
