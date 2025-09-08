import { Timestamp } from "firebase-admin/firestore";
import Big from "big.js";
import type { VaultViewState } from "@/utils/types/vault_view_state";
import type { TransformedVaultState } from "@/utils/types/transformed_vault_state";
import { getField } from "../object";
import { isString, isNumber, isAcceptedAt, isNonEmptyString } from "../guards";
import { numberToIntegerString } from "@/utils/numbers";

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
  const { owner, liquidity_request, accepted_offer, liquidation, unstake_entries, current_epoch } = vault_state;

  let state: "pending" | "active" | "idle" = "idle";
  if (liquidity_request) {
    state = accepted_offer ? "active" : "pending";
  }

  const transformed: TransformedVaultState = {
    owner,
    state,
  };

  if (typeof current_epoch === "number" && Number.isFinite(current_epoch)) {
    transformed.current_epoch = current_epoch;
  }

  // Accept both Vec<(AccountId, UnstakeEntry)> serialized as an array of pairs,
  // and an object map { [validator]: UnstakeEntry } for forward/backward compatibility.
  if (Array.isArray(unstake_entries) || (unstake_entries && typeof unstake_entries === "object")) {
    const entries: TransformedVaultState["unstake_entries"] = [];
    const pushEntry = (validator: unknown, entry: unknown) => {
      const v = typeof validator === "string" ? validator : undefined;
      if (!v || !entry || typeof entry !== "object") return;
      const amountRaw = (entry as Record<string, unknown>)["amount"];
      const epochRaw = (entry as Record<string, unknown>)["epoch_height"];
      const epoch = typeof epochRaw === "number" && Number.isFinite(epochRaw) ? epochRaw : undefined;
      let amount: string | undefined;
      if (typeof amountRaw === "string") amount = amountRaw;
      else if (typeof amountRaw === "number" && Number.isFinite(amountRaw)) {
        amount = numberToIntegerString(amountRaw);
      }
      else if (typeof amountRaw === "bigint") amount = amountRaw.toString();
      if (amount && epoch !== undefined) entries.push({ validator: v, amount, epoch_height: epoch });
    };

    if (Array.isArray(unstake_entries)) {
      for (const pair of unstake_entries) {
        if (Array.isArray(pair) && pair.length >= 2) {
          pushEntry(pair[0], pair[1]);
        }
      }
    } else {
      for (const [validator, entry] of Object.entries(unstake_entries as Record<string, unknown>)) {
        pushEntry(validator, entry);
      }
    }
    if (entries.length > 0) transformed.unstake_entries = entries;
  }

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
    const raw = (liquidation as Record<string, unknown>)["liquidated"];
    let liquidated: string | undefined;
    if (typeof raw === "string") liquidated = raw;
    else if (typeof raw === "number" && Number.isFinite(raw)) {
      liquidated = numberToIntegerString(raw);
    } else if (typeof raw === "bigint") liquidated = raw.toString();
    if (liquidated !== undefined) transformed.liquidation = { liquidated };
  }

  return transformed;
}
