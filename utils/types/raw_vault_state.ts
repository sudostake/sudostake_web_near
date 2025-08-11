export interface RawVaultState {
  owner: string;
  liquidity_request?: {
    token: string;
    amount: string;
    interest: string;
    collateral: string;
    duration: number;
  };
  accepted_offer?: {
    lender: string;
    // Nanoseconds since epoch. May come as bigint (from indexers), string (safe for big ints), or number.
    accepted_at: string | number | bigint;
  };
  liquidation?: {
    liquidated: string;
  };
}
