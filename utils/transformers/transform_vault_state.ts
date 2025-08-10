import { Timestamp } from "firebase-admin/firestore";
import type { RawVaultState } from "@/utils/types/raw_vault_state";
import type { TransformedVaultState } from "@/utils/types/transformed_vault_state";

/**
 * Transforms raw vault state into a Firestore-compatible object.
 *
 * Transformations:
 * - Leaves `duration` as seconds (numeric) — allows future expiration logic via `accepted_at + duration`
 * - Converts `accepted_offer.accepted_at` (nanoseconds) into Firestore `Timestamp`
 * - Preserves high-precision fields (`amount`, `interest`, `collateral`, `liquidated`)
 * - Computes vault `state`:
 *    - "idle" → no liquidity request
 *    - "pending" → liquidity request without accepted offer
 *    - "active" → liquidity request with accepted offer
 */
export function transformVaultState(
  vault_state: RawVaultState
): TransformedVaultState {
  const { owner, liquidity_request, accepted_offer, liquidation } = vault_state;

  let state: "pending" | "active" | "idle" = "idle";
  if (liquidity_request) {
    state = accepted_offer ? "active" : "pending";
  }

  const transformed: TransformedVaultState = {
    owner,
    state,
  };

  if (liquidity_request) {
    const { token, amount, interest, collateral, duration } = liquidity_request;
    transformed.liquidity_request = {
      token,
      amount,
      interest,
      collateral,
      duration,
    };
  }

  if (accepted_offer) {
    transformed.accepted_offer = {
      lender: accepted_offer.lender,
      accepted_at: Timestamp.fromMillis(
        Math.floor(Number(accepted_offer.accepted_at) / 1_000_000)
      ),
    };
  }

  if (liquidation) {
    transformed.liquidation = {
      liquidated: liquidation.liquidated,
    };
  }

  return transformed;
}

