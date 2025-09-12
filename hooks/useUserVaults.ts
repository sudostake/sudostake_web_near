"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query as fsQuery, where } from "firebase/firestore";
import { getFirebaseDb } from "@/utils/firebaseClient";
import { tsToMillis } from "@/utils/firestoreTimestamps";

export type UseUserVaultsResult = {
  data: string[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Fetch and manage the list of user vault IDs for a given owner and factory.
 */
export function useUserVaults(
  owner: string | null | undefined,
  factoryId: string | null | undefined
): UseUserVaultsResult {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listenerKey, setListenerKey] = useState<number>(0);

  const canQuery = useMemo(() => !!owner && !!factoryId, [owner, factoryId]);

  const refetch = useCallback(() => {
    setListenerKey((k) => k + 1);
  }, []);

  useEffect(() => {
    setError(null);
    if (!canQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const q = fsQuery(
      collection(db, String(factoryId)),
      where("owner", "==", String(owner))
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sortedDocs = snapshot.docs
          .slice()
          .sort((a, b) => (tsToMillis(b.get("updated_at") as unknown) ?? 0) - (tsToMillis(a.get("updated_at") as unknown) ?? 0));
        setData(sortedDocs.map((doc) => doc.id));
        setLoading(false);
      },
      (err) => {
        setError(err?.message ?? "Failed to subscribe to vaults");
        setData(null);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [owner, factoryId, canQuery, listenerKey]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
