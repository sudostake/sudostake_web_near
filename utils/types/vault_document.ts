import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { TransformedVaultState } from "@/utils/types/transformed_vault_state";

// Complete Firestore vault document shape (what we store in a collection per factory)
export interface VaultDocument extends TransformedVaultState {
  factory_id: string;
  tx_hash: string | null;
  created_at?: Timestamp | FieldValue;
  updated_at?: Timestamp | FieldValue;
}

