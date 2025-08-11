"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type IndexVaultParams = {
  factoryId: string;
  vault: string;
  txHash?: string;
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

  const inFlight = useRef<Map<string, Promise<void>>>(new Map());
  const aborters = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    return () => {
      aborters.current.forEach((c) => c.abort());
      aborters.current.clear();
    };
  }, []);

  // No client-side retries. The server already performs the necessary retry/backoff.

  const indexVault = useCallback(
    async ({ factoryId, vault, txHash }: IndexVaultParams, opts?: IndexVaultOptions) => {
      const dedupeKey = opts?.dedupeKey ?? `${factoryId}:${vault}:${txHash ?? ""}`;

      const existing = inFlight.current.get(dedupeKey);
      if (existing) return existing;

      const controller = new AbortController();
      const externalSignal = opts?.signal;
      if (externalSignal) {
        if (externalSignal.aborted) controller.abort();
        else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
      aborters.current.add(controller);

      const task = (async () => {
        setPending(true);
        setError(null);
        setSuccess(false);
        try {
          const res = await fetch("/api/index_vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ factory_id: factoryId, vault, tx_hash: txHash }),
          });

          if (res.ok) {
            setSuccess(true);
            return;
          }

          let body: any = null;
          try {
            body = await res.json();
          } catch {
            body = { error: await res.text().catch(() => "") };
          }

          const msg =
            typeof body?.error === "string"
              ? body.error
              : `Indexing failed: ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
          const detail = body?.details;
          const detailStr = detail !== undefined ? (typeof detail === "string" ? detail : JSON.stringify(detail)) : "";
          throw new Error(`${msg}${detailStr ? `: ${detailStr}` : ""}`);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : String(e));
          setSuccess(false);
          throw e;
        } finally {
          setPending(false);
          aborters.current.delete(controller);
          inFlight.current.delete(dedupeKey);
        }
      })();

      inFlight.current.set(dedupeKey, task);
      return task;
    },
    []
  );

  return { indexVault, pending, error, success };
}
