export interface FirestoreTimestampToDateLike {
  toDate: () => Date;
}

export interface FirestoreTimestampToMillisLike {
  toMillis: () => number;
}

export function hasToDate(v: unknown): v is FirestoreTimestampToDateLike {
  return (
    typeof v === "object" &&
    v !== null &&
    "toDate" in (v as Record<string, unknown>) &&
    typeof (v as Record<string, unknown>).toDate === "function"
  );
}

export function hasToMillis(v: unknown): v is FirestoreTimestampToMillisLike {
  return (
    typeof v === "object" &&
    v !== null &&
    "toMillis" in (v as Record<string, unknown>) &&
    typeof (v as Record<string, unknown>).toMillis === "function"
  );
}

export function tsToDate(ts: unknown): Date | null {
  try {
    if (hasToDate(ts)) {
      const d = ts.toDate();
      return d instanceof Date ? d : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function tsToMillis(ts: unknown): number | null {
  try {
    if (hasToMillis(ts)) {
      return ts.toMillis();
    }
    return null;
  } catch {
    return null;
  }
}

