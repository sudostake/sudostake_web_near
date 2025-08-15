import { Timestamp } from "firebase-admin/firestore";
import type { VaultViewState } from "@/utils/types/vault_view_state";
import type { TransformedVaultState } from "@/utils/types/transformed_vault_state";
import { getField } from "../object";
import { isString, isNumber, isAcceptedAt, isNonEmptyString } from "../guards";

// Note: We avoid non-null assertions by validating inline so TypeScript can narrow types.

/**
 * Transforms the consolidated on-chain VaultViewState into a Firestore-compatible object.
 *
 * We intentionally consume only a subset of VaultViewState (the same fields that
 * used to be described by the former RawVaultState). Consolidating around
 * VaultViewState removes type duplication and ambiguity while keeping this
 * transformer responsible for extracting and shaping just what we need.
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
export function transformVaultState(vault_state: VaultViewState): TransformedVaultState {
  // Consume only the subset we care about from the full consolidated on-chain view type.
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
    // These fields are the subset we care about from the contract's liquidity_request
    const token = getField<string>(liquidity_request, "token", isNonEmptyString);
    const amount = getField<string>(liquidity_request, "amount", isNonEmptyString);
    const interest = getField<string>(liquidity_request, "interest", isNonEmptyString);
    const collateral = getField<string>(liquidity_request, "collateral", isNonEmptyString);
    const duration = getField<number>(liquidity_request, "duration", isNumber);

    if (
      token !== undefined &&
      amount !== undefined &&
      interest !== undefined &&
      collateral !== undefined &&
      duration !== undefined
    ) {
      transformed.liquidity_request = {
        token,
        amount,
        interest,
        collateral,
        duration,
      };
    }
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
    const lender = getField<string>(accepted_offer, "lender", isString);
    const accepted_at = getField<string | number | bigint>(accepted_offer, "accepted_at", isAcceptedAt);
    if (lender !== undefined && accepted_at !== undefined) {
      transformed.accepted_offer = {
        lender,
        accepted_at: nsToTimestamp(accepted_at),
      };
    }
  }

  if (liquidation) {
    const liquidated = getField<string>(liquidation, "liquidated", isString);
    if (liquidated !== undefined) transformed.liquidation = { liquidated };
  }

  return transformed;
}
