import { Timestamp } from "firebase-admin/firestore";

export interface TransformedVaultState {
  owner: string;
  state: "idle" | "pending" | "active";
  liquidity_request?: {
    token: string;
    amount: string;
    interest: string;
    collateral: string;
    duration: number; // kept as seconds
  };
  accepted_offer?: {
    lender: string;
    accepted_at: Timestamp;
  };
  liquidation?: {
    liquidated: string;
  };
}

