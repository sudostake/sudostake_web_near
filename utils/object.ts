export function getField<T>(
  obj: unknown,
  key: string,
  guard: (value: unknown) => value is T
): T | undefined {
  if (obj && typeof obj === "object") {
    const value = (obj as Record<string, unknown>)[key];
    return guard(value) ? value : undefined;
  }
  return undefined;
}
