"use client";

import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { getFirebaseDb } from "@/utils/firebaseClient";
import { tsToMillis } from "@/utils/firestoreTimestamps";

export type PendingRequest = {
  id: string;
  state?: "idle" | "pending" | "active";
  owner?: string;
  liquidity_request?: {
    token: string;
    amount: string;
    interest: string;
    collateral: string;
    duration: number;
  };
};

export type Unsubscribe = () => void;

// Type guard reused locally
const isVaultState = (v: unknown): v is PendingRequest["state"] =>
  v === "idle" || v === "pending" || v === "active";

// Firestore-backed realtime subscription for pending liquidity requests
export function subscribePendingRequests(
  factoryId: string,
  onData: (docs: PendingRequest[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = fsQuery(collection(db, factoryId), where("state", "==", "pending"));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.slice().sort((a, b) => {
        const aMs = tsToMillis(a.get("updated_at") as unknown) ?? 0;
        const bMs = tsToMillis(b.get("updated_at") as unknown) ?? 0;
        return bMs - aMs;
      });
      onData(
        docs.map((d) => {
          const state: unknown = d.get("state");
          const owner: unknown = d.get("owner");
          const lr: unknown = d.get("liquidity_request");
          const liquidity_request =
            lr && typeof lr === "object"
              ? {
                  token: String((lr as any).token ?? ""),
                  amount: String((lr as any).amount ?? "0"),
                  interest: String((lr as any).interest ?? "0"),
                  collateral: String((lr as any).collateral ?? "0"),
                  duration: Number((lr as any).duration ?? 0),
                }
              : undefined;
          return {
            id: d.id,
            state: isVaultState(state) ? state : undefined,
            owner: typeof owner === "string" ? owner : undefined,
            ...(liquidity_request ? { liquidity_request } : {}),
          };
        })
      );
    },
    (err) => onError(err as Error)
  );
}

// REST API fetcher (non-realtime) — used as a fallback/polling source
export async function fetchPendingRequestsApi(factoryId: string): Promise<PendingRequest[]> {
  const url = new URL("/api/view_pending_liquidity_requests", window.location.origin);
  url.searchParams.set("factory_id", factoryId);
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text();
    }
    throw new Error(`Failed to fetch pending requests: ${JSON.stringify(details)}`);
  }
  const arr = (await res.json()) as Array<Record<string, unknown>>;
  return arr.map((doc) => {
    const lr = doc["liquidity_request"] as Record<string, unknown> | undefined;
    const liquidity_request = lr
      ? {
          token: String(lr["token"] ?? ""),
          amount: String(lr["amount"] ?? "0"),
          interest: String(lr["interest"] ?? "0"),
          collateral: String(lr["collateral"] ?? "0"),
          duration: Number(lr["duration"] ?? 0),
        }
      : undefined;
    return {
      id: String(doc["id"] ?? ""),
      state: isVaultState(doc["state"]) ? (doc["state"] as any) : undefined,
      owner: typeof doc["owner"] === "string" ? (doc["owner"] as string) : undefined,
      ...(liquidity_request ? { liquidity_request } : {}),
    } as PendingRequest;
  });
}

// Feature flag to choose data source. When true, use REST API polling; otherwise
// use Firestore realtime subscription. Configured via NEXT_PUBLIC_PENDING_USE_API.
const USE_API = /^1|true|yes$/i.test(String(process.env.NEXT_PUBLIC_PENDING_USE_API ?? ""));

// Polling-based subscription compatible with Unsubscribe interface
function subscribeViaApi(
  factoryId: string,
  onData: (docs: PendingRequest[]) => void,
  onError: (err: Error) => void,
  intervalMs = 10_000
): Unsubscribe {
  const hasName = (v: unknown): v is { name: string } =>
    typeof v === "object" && v !== null && "name" in v;
  const isAbortError = (v: unknown): boolean =>
    (typeof DOMException !== "undefined" && v instanceof DOMException && v.name === "AbortError") ||
    (v instanceof Error && v.name === "AbortError") ||
    (hasName(v) && (v as { name: string }).name === "AbortError");

  let stopped = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight: AbortController | null = null;

  const tick = async () => {
    try {
      inFlight?.abort();
      const ac = new AbortController();
      inFlight = ac;
      const list = await fetchPendingRequestsApi(factoryId);
      if (!stopped) onData(list);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (!stopped) onError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  void tick();
  timer = setInterval(tick, intervalMs);

  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
    inFlight?.abort();
  };
}

export function subscribePendingRequestsDataSource(
  factoryId: string,
  onData: (docs: PendingRequest[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  if (USE_API) return subscribeViaApi(factoryId, onData, onError);
  return subscribePendingRequests(factoryId, onData, onError);
}
