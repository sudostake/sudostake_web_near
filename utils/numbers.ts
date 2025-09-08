import Big from "big.js";

// Attempt to convert using Big.js (handles scientific notation and most cases).
// Note: Big.js may throw if the input number is non-finite (NaN or ±Infinity),
// or otherwise not representable. In those cases we fall back to safer strategies
// below that avoid throwing and still yield a sensible integer string.
function tryBigJsToIntegerString(n: number): string | undefined {
  try {
    return new Big(n).toFixed(0);
  } catch {
    return undefined;
  }
}

// Fallback: if the number is a safe integer, use toString()
function trySafeIntegerToString(n: number): string | undefined {
  return Number.isSafeInteger(n) ? n.toString() : undefined;
}

// Fallback: try to use BigInt for large integers
function tryBigIntToString(n: number): string | undefined {
  try {
    return BigInt(n).toString();
  } catch {
    return undefined;
  }
}

// Final fallback: use Math.trunc and convert to string (may cause precision loss for non-integer numbers)
function fallbackTruncToString(n: number): string {
  return String(Math.trunc(n));
}

// Public: safely convert a JS number to an integer string without precision loss when possible.
// Strategy (in order):
// 1) If it's a safe integer, use native toString (fast path).
// 2) Big.js toFixed(0) — handles scientific notation and typical integer-like numbers.
// 3) Try BigInt for large integers.
// 4) Final fallback: Math.trunc + toString (may cause precision loss for non-integer numbers)
//    to ensure we always return a string.
export function numberToIntegerString(n: number): string {
  return (
    trySafeIntegerToString(n) ??
    tryBigJsToIntegerString(n) ??
    tryBigIntToString(n) ??
    fallbackTruncToString(n)
  );
}

// Helpers to normalize various numeric shapes into a BigInt representing yocto amounts
export function stringToYoctoBigInt(s: string): bigint {
  if (/^\d+$/.test(s)) {
    try { return BigInt(s); } catch {}
  }
  try { return BigInt(new Big(s).toFixed(0)); } catch {}
  const digits = s.replace(/\D+/g, "");
  return digits ? BigInt(digits) : BigInt(0);
}

export function numberToYoctoBigInt(n: number): bigint {
  try { return BigInt(new Big(n).toFixed(0)); } catch {}
  try { return BigInt(new Big(n.toString()).toFixed(0)); } catch {}
  const digits = n.toString().replace(/\D+/g, "");
  return digits ? BigInt(digits) : BigInt(0);
}

export function toYoctoBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "string") return stringToYoctoBigInt(value);
  if (typeof value === "number" && Number.isFinite(value)) return numberToYoctoBigInt(value);
  return BigInt(0);
}

// Normalize a value (string|number|bigint) into an integer string.
export function normalizeToIntegerString(value: string | number | bigint): string {
  if (typeof value === "string") {
    return /^\d+$/.test(value) ? value : stringToYoctoBigInt(value).toString();
  }
  if (typeof value === "number") return numberToIntegerString(value);
  return value.toString();
}

