import { utils } from "near-api-js";
import { normalizeToIntegerString } from "@/utils/numbers";

/**
 * Safely format a yoctoNEAR value into NEAR string with given fractional digits.
 * Accepts string | number | bigint and normalizes to integer string first.
 */
export function safeFormatYoctoNear(value: string | number | bigint, fracDigits = 5): string {
  try {
    const s = normalizeToIntegerString(value);
    return utils.format.formatNearAmount(s, fracDigits);
  } catch {
    return typeof value === "string" ? value : String(value ?? "—");
  }
}

