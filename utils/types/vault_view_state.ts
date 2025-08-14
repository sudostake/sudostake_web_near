// TypeScript representation of the VaultViewState returned by the on-chain
// `get_vault_state` view method. This mirrors the Rust struct shape but keeps
// fields flexible where contract evolution may differ across versions.

export type AccountId = string;

// Minimal UnstakeEntry type; structure may vary by staking pool contract.
// We keep it as a generic record to avoid making assumptions.
export type UnstakeEntry = Record<string, unknown>;

// Matches the public view state returned from the `get_vault_state` method.
export interface VaultViewState {
  owner: AccountId;
  index: number;
  version: number;
  liquidity_request?: Record<string, unknown> | null;
  accepted_offer?: Record<string, unknown> | null;
  is_listed_for_takeover: boolean;
  active_validators: AccountId[];
  // Represented on-chain as Vec<(AccountId, UnstakeEntry)>; serialized as
  // an array of [validator_account_id, unstake_entry] pairs.
  unstake_entries: Array<[AccountId, UnstakeEntry]>;
  liquidation?: Record<string, unknown> | null;
  current_epoch: number;
}

