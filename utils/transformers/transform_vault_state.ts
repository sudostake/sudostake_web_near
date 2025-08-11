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

  // Helper: convert nanoseconds since epoch to Firestore Timestamp.
  // - If provided as string/bigint, preserves full nanosecond precision.
  // - If provided as number, falls back to millisecond precision using rounding.
  const nsToTimestamp = (ns: string | number | bigint): Timestamp => {
    const BILLION = BigInt(1000000000);
    if (typeof ns === "bigint") {
      const seconds = ns / BILLION;
      const nanos = ns % BILLION;
      return new Timestamp(Number(seconds), Number(nanos));
    }
    if (typeof ns === "string") {
      const bi = BigInt(ns);
      const seconds = bi / BILLION;
      const nanos = bi % BILLION;
      return new Timestamp(Number(seconds), Number(nanos));
    }
    // number path (potential precision loss if value exceeds MAX_SAFE_INTEGER)
    return Timestamp.fromMillis(Math.round(ns / 1_000_000));
  };

  if (accepted_offer) {
    transformed.accepted_offer = {
      lender: accepted_offer.lender,
      accepted_at: nsToTimestamp(accepted_offer.accepted_at),
    };
  }

  if (liquidation) {
    transformed.liquidation = {
      liquidated: liquidation.liquidated,
    };
  }

  return transformed;
}
