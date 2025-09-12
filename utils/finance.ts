import Big, { type BigSource } from "big.js";
import { SECONDS_PER_YEAR } from "@/utils/constants";

/**
 * Calculates simple annualized APR as a decimal (e.g., 0.08 for 8%).
 * - interest and amount are in the same units (minimal token units).
 * - durationSeconds is the term length in seconds.
 */
export function calculateApr(
  interest: BigSource,
  amount: BigSource,
  durationSeconds: number
): Big {
  try {
    const principal = new Big(amount);
    if (principal.lte(0)) return new Big(0);
    const intr = new Big(interest);
    const seconds = Math.max(1, Math.floor(durationSeconds || 0));
    return intr.div(principal).times(SECONDS_PER_YEAR).div(seconds);
  } catch {
    return new Big(0);
  }
}
