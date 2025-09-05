"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { getFirebaseDb } from "@/utils/firebaseClient";

export type VaultSummary = {
  id: string;
  state: "idle" | "pending" | "active";
};

export type UseUserVaultsSummariesResult = {
  data: VaultSummary[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useUserVaultsSummaries(
  owner: string | null | undefined,
  factoryId: string | null | undefined
): UseUserVaultsSummariesResult {
  const [data, setData] = useState<VaultSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listenerKey, setListenerKey] = useState<number>(0);

  const canQuery = useMemo(() => !!owner && !!factoryId, [owner, factoryId]);

  const refetch = () => setListenerKey((k) => k + 1);

  useEffect(() => {
    setError(null);
    if (!canQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const q = fsQuery(collection(db, String(factoryId)), where("owner", "==", String(owner)));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const isTimestamp = (v: unknown): v is { toMillis: () => number } =>
          typeof (v as { toMillis?: unknown })?.toMillis === "function";
        const isVaultState = (v: unknown): v is VaultSummary["state"] =>
          v === "idle" || v === "pending" || v === "active";

        const docs = snap.docs.slice().sort((a, b) => {
          const aTs: unknown = a.get("updated_at") as unknown;
          const bTs: unknown = b.get("updated_at") as unknown;
          const aMs = isTimestamp(aTs) ? aTs.toMillis() : 0;
          const bMs = isTimestamp(bTs) ? bTs.toMillis() : 0;
          return bMs - aMs;
        });
        const items: VaultSummary[] = docs.map((d) => {
          const raw = d.get("state") as unknown;
          return { id: d.id, state: isVaultState(raw) ? raw : "idle" };
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err?.message ?? "Failed to subscribe to vaults");
        setData(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [owner, factoryId, canQuery, listenerKey]);

  return { data, loading, error, refetch };
}
