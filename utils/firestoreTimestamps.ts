export interface FirestoreTimestampToDateLike {
  toDate: () => Date;
}

export interface FirestoreTimestampToMillisLike {
  toMillis: () => number;
}

export function hasToDate(v: unknown): v is FirestoreTimestampToDateLike {
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    return "toDate" in obj && typeof obj.toDate === "function";
  }
  return false;
}

export function hasToMillis(v: unknown): v is FirestoreTimestampToMillisLike {
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    return "toMillis" in obj && typeof obj.toMillis === "function";
  }
  return false;
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
