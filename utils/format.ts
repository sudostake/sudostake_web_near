export function parseNumber(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return NaN;
  const numeric = String(input).replace(/[^0-9.]/g, "");
  if (!numeric) return NaN;
  const n = Number(numeric);
  return Number.isNaN(n) ? NaN : n;
}

const ZERO_ONLY_REGEX = /^0+$/;

/**
 * Format a minimal-unit token amount into a human-readable decimal string.
 *
 * Example: minimal="0012300", decimals=4 → "12.3"
 *
 * Rules:
 * - Fast-path zero: returns "0" for inputs like "0", "00", …
 * - Inserts the decimal point according to `decimals`
 * - Trims superfluous leading zeros, trailing zeros, and trailing decimal point
 */
export function formatMinimalTokenAmount(minimal: string, decimals: number): string {
  if (ZERO_ONLY_REGEX.test(minimal)) return "0";
  const s = minimal.replace(/^0+(?=\d)/, "");
  const safeDecimals = Math.max(0, decimals);
  const paddedString = s.length <= safeDecimals ? "0".repeat(safeDecimals - s.length + 1) + s : s;
  const decimalIndex = paddedString.length - safeDecimals;
  const withDot =
    safeDecimals === 0
      ? paddedString
      : `${paddedString.slice(0, decimalIndex)}.${paddedString.slice(decimalIndex)}`;
  return withDot
    .replace(/^0+(\d)/, "$1")
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
}
