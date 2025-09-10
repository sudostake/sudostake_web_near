/**
 * Compact a decimal string by trimming the fractional part to maxDecimals
 * and dropping trailing zeros. Returns only the integer part if the fractional
 * part becomes empty after trimming.
 */
export function shortAmount(display: string, maxDecimals = 6): string {
  const [intPart, fracPart] = display.split(".");
  if (!fracPart) return intPart;
  const trimmed = fracPart.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmed.length > 0 ? `${intPart}.${trimmed}` : intPart;
}

/**
 * Parse a human display number string into a JS number.
 * Strips common formatting like commas and spaces. Returns NaN if not parseable.
 */
export function parseNumber(input: string): number {
  if (typeof input !== 'string') return Number.NaN;
  const cleaned = input.replace(/[_,\s]/g, '').replace(/,/g, '');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : Number.NaN;
}

/**
 * Format an integer minimal-unit amount into a human decimal string.
 * Trims trailing zeros in the fractional part.
 */
export function formatMinimalTokenAmount(minimal: string, decimals: number): string {
  try {
    if (decimals <= 0) return minimal.replace(/^0+/, '') || '0';
    const neg = minimal.startsWith('-');
    const digits = neg ? minimal.slice(1) : minimal;
    const padded = digits.padStart(decimals + 1, '0');
    const i = padded.length - decimals;
    const intPart = padded.slice(0, i).replace(/^0+/, '') || '0';
    let frac = padded.slice(i).replace(/0+$/, '');
    const body = frac.length > 0 ? `${intPart}.${frac}` : intPart;
    return neg ? `-${body}` : body;
  } catch {
    return minimal;
  }
}
