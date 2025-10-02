"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/utils/errors";
import { useIndexingBlocker } from "./useIndexingBlocker";

type FetchWithKeepAlive = RequestInit & { keepalive?: boolean };

export type IndexVaultParams = {
  factoryId: string;
  vault: string;
  txHash: string;
};

export type IndexVaultOptions = {
  signal?: AbortSignal;
  dedupeKey?: string;
};

export type UseIndexVaultResult = {
  indexVault: (params: IndexVaultParams, options?: IndexVaultOptions) => Promise<void>;
  pending: boolean;
  error: string | null;
  success: boolean;
};

export function useIndexVault(): UseIndexVaultResult {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inFlight = useRef<Set<string>>(new Set());
  const aborters = useRef<Set<AbortController>>(new Set());
  const { setFailedJob, clearJobIfMatch } = useIndexingBlocker();

  useEffect(() => {
    return () => {
      aborters.current.forEach((c) => c.abort());
      aborters.current.clear();
    };
  }, []);

  const indexVault = useCallback(
    async ({ factoryId, vault, txHash }: IndexVaultParams, opts?: IndexVaultOptions) => {
      const dedupeKey = opts?.dedupeKey ?? `${factoryId}:${vault}:${txHash}`;
      if (inFlight.current.has(dedupeKey)) return;

      const controller = new AbortController();
      const externalSignal = opts?.signal;
      if (externalSignal) {
        if (externalSignal.aborted) return;
        externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
      aborters.current.add(controller);
      inFlight.current.add(dedupeKey);

      setPending(true);
      setError(null);
      setSuccess(false);

      try {
        const enqueueBody = JSON.stringify({ factory_id: factoryId, vault, tx_hash: txHash });
        void fetch("/api/indexing/enqueue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: enqueueBody,
          signal: controller.signal,
          keepalive: true,
        }).catch(() => {});
      } catch {}

      try {
        const res = await fetch("/api/index_vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factory_id: factoryId, vault, tx_hash: txHash }),
          signal: controller.signal,
          keepalive: true,
        } as FetchWithKeepAlive);
        if (!res.ok) {
          let details: string | undefined;
          try {
            const j = await res.json();
            details = typeof j?.error === "string" ? j.error : j?.message ?? JSON.stringify(j);
          } catch {
            details = await res.text();
          }
          const message = details ? `Indexing failed: ${details}` : `Indexing failed with status ${res.status}`;
          setError(message);
          setSuccess(false);
          // Persist failed job and block UI
          setFailedJob({ factoryId, vault, txHash, lastError: message });
          throw new Error(message);
        }

        setSuccess(true);
        setError(null);
        clearJobIfMatch({ factoryId, vault, txHash });
      } catch (err: unknown) {
        if (isAbortError(err)) {
          setPending(false);
          aborters.current.delete(controller);
          inFlight.current.delete(dedupeKey);
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setSuccess(false);
        setFailedJob({ factoryId, vault, txHash, lastError: message });
        throw err;
      } finally {
        setPending(false);
        aborters.current.delete(controller);
        inFlight.current.delete(dedupeKey);
      }
    },
    [clearJobIfMatch, setFailedJob]
  );

  return { indexVault, pending, error, success };
}
