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
    accepted_at: number; // nanoseconds
  };
  liquidation?: {
    liquidated: string;
  };
}

