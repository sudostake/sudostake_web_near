export const SUPPORTED_NETWORKS = ["testnet", "mainnet"] as const;
export type Network = (typeof SUPPORTED_NETWORKS)[number];

export const DEFAULT_NETWORK: Network = "testnet";
export const LOCAL_STORAGE_NETWORK_KEY = "selectedNetwork";

// Centralized RPC endpoints per network
export const RPC_ENDPOINTS: Record<Network, string> = {
  mainnet: "https://rpc.mainnet.fastnear.com",
  testnet: "https://rpc.testnet.fastnear.com",
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
