"use client";

import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { getFirebaseDb } from "@/utils/firebaseClient";
import { tsToMillis } from "@/utils/firestoreTimestamps";

export type LenderPosition = {
  id: string;
  state?: "idle" | "pending" | "active";
};

export type Unsubscribe = () => void;

// Shared type guard for LenderPosition.state
const isLenderState = (v: unknown): v is LenderPosition["state"] =>
  v === "idle" || v === "pending" || v === "active";

// Firestore-backed subscription. The view layer does not need to know whether
// data comes from Firestore or API; this utility can be swapped for an API
// fetch/polling strategy without changing consumers.
export function subscribeLenderPositions(
  factoryId: string,
  lender: string,
  onData: (docs: LenderPosition[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = fsQuery(
    collection(db, factoryId),
    where("accepted_offer.lender", "==", lender)
  );
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.slice().sort((a, b) => {
        const aVal: unknown = a.get("accepted_offer.accepted_at");
        const bVal: unknown = b.get("accepted_offer.accepted_at");
        const aMs = tsToMillis(aVal) ?? 0;
        const bMs = tsToMillis(bVal) ?? 0;
        return bMs - aMs;
      });
      onData(
        docs.map((d) => {
          const state: unknown = d.get("state");
          return { id: d.id, state: isLenderState(state) ? state : undefined };
        })
      );
    },
    (err) => onError(err as Error)
  );
}

// REST API fetcher (non-realtime). Not used by default, but kept here so we can
// switch to API without impacting views/hooks.
export async function fetchLenderPositionsApi(
  factoryId: string,
  lender: string
): Promise<LenderPosition[]> {
  const url = new URL("/api/view_lender_positions", window.location.origin);
  url.searchParams.set("factory_id", factoryId);
  url.searchParams.set("lender_id", lender);
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text();
    }
    throw new Error(`Failed to fetch lender positions: ${JSON.stringify(details)}`);
  }
  const arr = (await res.json()) as Array<Record<string, unknown>>;
  return arr.map((doc) => ({
    id: String(doc["id"] ?? ""),
    state: isLenderState(doc["state"]) ? doc["state"] : undefined,
  }));
}

// Feature flag to choose data source. When true, use REST API polling; otherwise
// use Firestore realtime subscription. Configured via NEXT_PUBLIC_LENDING_USE_API.
const USE_API = /^1|true|yes$/i.test(String(process.env.NEXT_PUBLIC_LENDING_USE_API ?? ""));

// Polling-based "subscription" that matches the Unsubscribe interface.
function subscribeViaApi(
  factoryId: string,
  lender: string,
  onData: (docs: LenderPosition[]) => void,
  onError: (err: Error) => void,
  intervalMs = 10_000
): Unsubscribe {
  const hasName = (v: unknown): v is { name: string } =>
    typeof v === "object" && v !== null && "name" in (v as Record<string, unknown>);
  const isAbortError = (v: unknown): boolean =>
    (typeof DOMException !== "undefined" && v instanceof DOMException && v.name === "AbortError") ||
    (v instanceof Error && v.name === "AbortError") ||
    (hasName(v) && (v as { name: string }).name === "AbortError");
  let stopped = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight: AbortController | null = null;

  const tick = async () => {
    try {
      // Abort previous request if still running to avoid race
      inFlight?.abort();
      const ac = new AbortController();
      inFlight = ac;
      const list = await fetchLenderPositionsApi(factoryId, lender);
      if (!stopped) onData(list);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (!stopped) onError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  // Initial fetch immediately, then poll
  void tick();
  timer = setInterval(tick, intervalMs);

  return () => {
    stopped = true;
    if (timer) clearInterval(timer);
    inFlight?.abort();
  };
}

// Unified subscribe that hides the chosen data source from consumers.
export function subscribeLenderPositionsDataSource(
  factoryId: string,
  lender: string,
  onData: (docs: LenderPosition[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  if (USE_API) {
    return subscribeViaApi(factoryId, lender, onData, onError);
  }
  return subscribeLenderPositions(factoryId, lender, onData, onError);
}
