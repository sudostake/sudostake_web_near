export const SUPPORTED_NETWORKS = ["testnet", "mainnet"] as const;
export type Network = (typeof SUPPORTED_NETWORKS)[number];

export const DEFAULT_NETWORK: Network = "testnet";
export const LOCAL_STORAGE_NETWORK_KEY = "selectedNetwork";

// Centralized RPC endpoints per network
export const RPC_ENDPOINTS: Record<Network, string> = {
  mainnet: "https://rpc.mainnet.fastnear.com",
  testnet: "https://rpc.testnet.fastnear.com",
} as const;

// Factory contract addresses per network
export const FACTORY_CONTRACTS: Record<Network, string> = {
  mainnet: "sudostake.near",
  testnet: "nzaza.testnet",
} as const;

export function getActiveNetwork(): Network {
  if (typeof window !== "undefined") {
    const stored = window.localStorage
      .getItem(LOCAL_STORAGE_NETWORK_KEY)
      ?.toLowerCase();
    if (stored && (SUPPORTED_NETWORKS as readonly string[]).includes(stored)) {
      return stored as Network;
    }
  }

  return DEFAULT_NETWORK;
}

export function setActiveNetwork(network: Network) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_STORAGE_NETWORK_KEY, network);
  }
}

export function rpcPath(network: Network): string {
  return `/api/rpc?network=${encodeURIComponent(network)}`;
}

export function rpcUpstream(network: Network): string {
  return RPC_ENDPOINTS[network];
}

// Get the factory contract for a given network
export function factoryContract(network: Network): string {
  return FACTORY_CONTRACTS[network];
}

// Convenience: get the factory id for the currently active network
export function getActiveFactoryId(): string {
  return factoryContract(getActiveNetwork());
}

// Explorer helpers
export function explorerAccountUrl(network: Network, accountId: string): string {
  const base = network === "mainnet" ? "https://explorer.near.org" : "https://explorer.testnet.near.org";
  return `${base}/accounts/${accountId}`;
}
