import { Timestamp } from "firebase-admin/firestore";

export interface TransformedVaultState {
  owner: string;
  state: "idle" | "pending" | "active";
  // Optional current epoch height from chain; used to compute unlock ETA for unstake entries
  current_epoch?: number;
  // Unstake entries collected from validators during liquidation or undelegation
  // Each entry contains the target unlock epoch and amount (yoctoNEAR)
  unstake_entries?: Array<{
    validator: string;
    amount: string; // yoctoNEAR
    epoch_height: number;
  }>;
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
