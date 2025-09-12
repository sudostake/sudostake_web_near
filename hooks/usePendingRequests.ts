"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribePendingRequestsDataSource } from "@/utils/data/pending";
import type { PendingRequest } from "@/utils/data/pending";

export type UsePendingRequestsResult = {
  data: PendingRequest[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function usePendingRequests(
  factoryId: string | null | undefined
): UsePendingRequestsResult {
  const [data, setData] = useState<PendingRequest[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listenerKey, setListenerKey] = useState<number>(0);

  const canQuery = useMemo(() => !!factoryId, [factoryId]);
  const refetch = useCallback(() => setListenerKey((k) => k + 1), []);

  useEffect(() => {
    setError(null);
    if (!canQuery) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribePendingRequestsDataSource(
      String(factoryId),
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [factoryId, canQuery, listenerKey]);

  return { data, loading, error, refetch };
}
