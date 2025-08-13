export function parseNumber(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return NaN;
  const numeric = String(input).replace(/[^0-9.]/g, "");
  if (!numeric) return NaN;
  const n = Number(numeric);
  return Number.isNaN(n) ? NaN : n;
}

