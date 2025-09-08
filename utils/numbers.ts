import Big from "big.js";

// Log warnings only in non-production environments to avoid noisy consoles in prod.
const DEBUG_NUMBERS = ((): boolean => {
  try {
    // In Next.js, process.env.NODE_ENV is statically replaced at build time on the client
    return typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : true;
  } catch {
    return true;
  }
})();
const warn = (...args: unknown[]) => {
  if (!DEBUG_NUMBERS) return;
  try { console.warn(...(args as any)); } catch {}
};

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
    try { return BigInt(s); } catch (e) {
      warn(`[stringToYoctoBigInt] Failed to parse as BigInt:`, s, e);
      // Fall through to other strategies below.
    }
  }
  try { return BigInt(new Big(s).toFixed(0)); } catch (e) {
    warn(`[stringToYoctoBigInt] Failed Big(s).toFixed(0) -> BigInt:`, s, e);
  }
  const digits = s.replace(/\D+/g, "");
  if (digits) {
    warn(`[stringToYoctoBigInt] Fallback extracting digits:`, { input: s, digits });
    return BigInt(digits);
  }
  warn(`[stringToYoctoBigInt] No digits found; returning 0 for input:`, s);
  return BigInt(0);
}

export function numberToYoctoBigInt(n: number): bigint {
  try { return BigInt(new Big(n).toFixed(0)); } catch (e) {
    warn(`[numberToYoctoBigInt] Failed Big(n).toFixed(0) -> BigInt:`, n, e);
  }
  // Use Big(n.toString()) as a fallback to avoid floating-point representation quirks
  // (e.g., scientific notation) when constructing Big from a number directly.
  try { return BigInt(new Big(n.toString()).toFixed(0)); } catch (e) {
    warn(`[numberToYoctoBigInt] Failed Big(n.toString()).toFixed(0) -> BigInt:`, n, e);
  }
  const digits = n.toString().replace(/\D+/g, "");
  if (digits) {
    warn(`[numberToYoctoBigInt] Fallback extracting digits:`, { input: n, digits });
    return BigInt(digits);
  }
  warn(`[numberToYoctoBigInt] No digits found; returning 0 for input:`, n);
  return BigInt(0);
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
