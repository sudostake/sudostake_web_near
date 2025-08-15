export const isString = (v: unknown): v is string => typeof v === "string";

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

export const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const isBigInt = (v: unknown): v is bigint => typeof v === "bigint";

export const isAcceptedAt = (v: unknown): v is string | number | bigint =>
  typeof v === "string" || typeof v === "number" || typeof v === "bigint";

