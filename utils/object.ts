export const getField = <T>(obj: unknown, key: string): T | undefined => {
  if (obj && typeof obj === "object") {
    return (obj as Record<string, unknown>)[key] as T | undefined;
  }
  return undefined;
};
