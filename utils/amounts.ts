/**
 * Sum minimal-unit string amounts safely using BigInt and return a minimal-unit string.
 * Ignores null/undefined by treating them as "0".
 */
export function sumMinimal(...values: Array<string | null | undefined>): string {
  try {
    let acc = BigInt(0);
    for (const v of values) {
      const s = (v ?? "0").toString();
      acc += BigInt(s);
    }
    return acc.toString();
  } catch {
    return "0";
  }
}
