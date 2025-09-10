/**
 * Constants for native token (NEAR) and related display symbols.
 */
export const NATIVE_TOKEN = "NEAR";
/**
 * Symbol for the native token (Ⓝ) used in compact UI elements.
 */
export const NATIVE_TOKEN_SYMBOL = "Ⓝ";
/** One-time fee (in yoctoNEAR) to mint a new vault. */
export const VAULT_CREATION_FEE = "10000000000000000000000000";
/** Contract method name to mint a vault on the factory. */
export const MINT_VAULT_METHOD = "mint_vault";
/** Safe default gas (in units of gas) to attach to function calls (300 Tgas). */
export const DEFAULT_GAS = "300000000000000";
/** Deposit of 1 yoctoNEAR required for proof-of-intent on certain calls. */
export const ONE_YOCTO = "1";
/** Number of decimal places for USDC (NEP-141 token). */
export const USDC_DECIMALS = 6;
/** Number of decimal places for NEAR native token. */
export const NATIVE_DECIMALS = 24;
/** Number of seconds in one day. */
export const SECONDS_PER_DAY = 86_400;
/** Number of seconds in one hour. */
export const SECONDS_PER_HOUR = 3_600;
/** Contract-level action identifiers used in FT transfer messages. */
export const ACTION_ACCEPT_LIQUIDITY = "AcceptLiquidityRequest" as const;

/** Approximate epoch duration on NEAR mainnet/testnet (12 hours). */
export const AVERAGE_EPOCH_SECONDS = 43_200; // 12h
/** Number of epochs required before unstaked NEAR becomes withdrawable (mirrors contract). */
export const NUM_EPOCHS_TO_UNLOCK = 4;
