"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type UseUserVaultsResult = {
  data: string[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Fetch and manage the list of user vault IDs for a given owner and factory.
 */
export function useUserVaults(owner: string | null | undefined, factoryId: string | null | undefined): UseUserVaultsResult {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    if (!owner || !factoryId) return null;
    const params = new URLSearchParams({ owner, factory_id: factoryId });
    return `/api/get_user_vaults?${params.toString()}`;
  }, [owner, factoryId]);

  const load = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(query);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : `Failed to fetch vaults: ${res.status} ${res.statusText}`
        );
      }
      setData(body as string[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!query) return;
    void load();
  }, [query, load]);

  return {
    data,
    loading,
    error,
    refetch: load,
  };
}

