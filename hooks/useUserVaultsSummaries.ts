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
        const docs = snap.docs.slice().sort((a, b) => {
          const aTs: any = a.get("updated_at");
          const bTs: any = b.get("updated_at");
          const aMs = aTs && typeof aTs.toMillis === "function" ? aTs.toMillis() : 0;
          const bMs = bTs && typeof bTs.toMillis === "function" ? bTs.toMillis() : 0;
          return bMs - aMs;
        });
        const items: VaultSummary[] = docs.map((d) => ({ id: d.id, state: (d.get("state") as any) ?? "idle" }));
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

