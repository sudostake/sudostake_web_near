"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/utils/firebaseClient";

import type { VaultDocument } from "@/utils/types/vault_document";

export type UseVaultResult = {
  data: VaultDocument | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Subscribe to a single vault document within the factory collection.
 * Mobile-friendly consumers can render skeletons while loading.
 */
export function useVault(
  factoryId?: string | null,
  vaultId?: string | null
): UseVaultResult {
  const [data, setData] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const canQuery = useMemo(() => Boolean(factoryId && vaultId), [factoryId, vaultId]);

  const refetch = () => setVersion((v) => v + 1);

  useEffect(() => {
    setError(null);
    if (!canQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseDb();
    const ref = doc(db, String(factoryId), String(vaultId));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData((snap.data() as VaultDocument) ?? null);
        setLoading(false);
      },
      (err) => {
        setError(err?.message ?? "Failed to load vault");
        setData(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [factoryId, vaultId, canQuery, version]);

  return { data, loading, error, refetch };
}
