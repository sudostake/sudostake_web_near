import { RPC_ENDPOINTS } from "@/utils/networks";
export { isValidAccountId } from "@/utils/validation/account";

export type FactoryWhitelist = Record<string, string>;

export const DEFAULT_FACTORY_CONTRACT_WHITELIST: FactoryWhitelist = {
  "nzaza.testnet": RPC_ENDPOINTS.testnet,
  "sudostake.near": RPC_ENDPOINTS.mainnet,
};

export const FACTORY_CONTRACT_WHITELIST: FactoryWhitelist = DEFAULT_FACTORY_CONTRACT_WHITELIST;
