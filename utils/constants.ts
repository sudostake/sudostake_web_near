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
/** Number of days in a (non-leap) year, used for simple APR estimates. */
export const DAYS_PER_YEAR = 365;
/** Number of seconds in a (non-leap) year. */
export const SECONDS_PER_YEAR = DAYS_PER_YEAR * SECONDS_PER_DAY;
/** Contract-level action identifiers used in FT transfer messages. */
export const ACTION_ACCEPT_LIQUIDITY = "AcceptLiquidityRequest" as const;

/** Approximate epoch duration on NEAR mainnet/testnet (12 hours). */
export const AVERAGE_EPOCH_SECONDS = 43_200; // 12h
/** Number of epochs required before unstaked NEAR becomes withdrawable (mirrors contract). */
export const NUM_EPOCHS_TO_UNLOCK = 4;

/** Default vault state used for UI fallbacks. */
export const DEFAULT_VAULT_STATE = "idle" as const;

/**
 * Maximum number of active validators a vault can delegate to.
 * This mirrors the contract-level limit and is used for UI gating.
 */
export const MAX_ACTIVE_VALIDATORS = 2 as const;
