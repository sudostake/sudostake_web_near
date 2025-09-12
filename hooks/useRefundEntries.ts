"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

export type RefundEntry = {
  token?: string | null;
  proposer: string;
  amount: string; // U128 serialized
  added_at_epoch: number;
};

export function useRefundEntries(vaultId?: string | null) {
  const { viewFunction } = useWalletSelector();
  const [entries, setEntries] = useState<Array<[number, RefundEntry]>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ver, setVer] = useState(0);

  const refetch = useCallback(() => setVer((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!vaultId) { setEntries([]); return; }
      setLoading(true);
      setError(null);
      try {
        const res = await viewFunction({
          contractId: vaultId,
          method: "get_refund_entries",
          args: { account_id: null },
        });
        if (!cancelled) setEntries(Array.isArray(res) ? res : []);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string'
            ? String((e as { message?: unknown }).message)
            : 'Failed to load refund entries';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [vaultId, viewFunction, ver]);

  const count = useMemo(() => entries.length, [entries]);
  return { entries, count, loading, error, refetch } as const;
}
