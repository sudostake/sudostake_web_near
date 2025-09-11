"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribeLenderPositionsDataSource } from "@/utils/data/lending";
import type { LenderPosition } from "@/utils/data/lending";

export type UseLenderPositionsResult = {
  data: LenderPosition[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

// Subscribes to vaults where the current user is the lender.
// We do client-side sorting by accepted_offer.accepted_at (desc) to avoid requiring a composite index.
export function useLenderPositions(
  lender: string | null | undefined,
  factoryId: string | null | undefined
): UseLenderPositionsResult {
  const [data, setData] = useState<LenderPosition[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listenerKey, setListenerKey] = useState<number>(0);

  const canQuery = useMemo(() => !!lender && !!factoryId, [lender, factoryId]);

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
    const unsubscribe = subscribeLenderPositionsDataSource(
      String(factoryId),
      String(lender),
      (docs) => {
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err?.message ?? "Failed to subscribe to lender positions");
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [lender, factoryId, canQuery, listenerKey]);

  return { data, loading, error, refetch };
}
