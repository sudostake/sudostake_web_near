"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/utils/errors";

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

  // Track fire-and-forget requests to avoid duplicate enqueues within a short window
  const inFlight = useRef<Set<string>>(new Set());
  const aborters = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    return () => {
      aborters.current.forEach((c) => c.abort());
      aborters.current.clear();
    };
  }, []);

  // Fire-and-forget: enqueue and return immediately. The server/worker handles retries/backoff.

  const indexVault = useCallback(
    async ({ factoryId, vault, txHash }: IndexVaultParams, opts?: IndexVaultOptions) => {
      const dedupeKey = opts?.dedupeKey ?? `${factoryId}:${vault}:${txHash}`;

      if (inFlight.current.has(dedupeKey)) return; // already scheduled

      const controller = new AbortController();
      const externalSignal = opts?.signal;
      if (externalSignal) {
        if (externalSignal.aborted) return;
        externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
      aborters.current.add(controller);

      // Immediately mark success for UX; this is fire-and-forget enqueue
      setError(null);
      setSuccess(true);
      setPending(false);

      inFlight.current.add(dedupeKey);

      const body = JSON.stringify({ factory_id: factoryId, vault, tx_hash: txHash });

      // Try sendBeacon for true fire-and-forget when available
      let sent = false;
      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([body], { type: "application/json" });
          sent = navigator.sendBeacon("/api/indexing/enqueue", blob);
        }
      } catch {
        // ignore
      }

      const kickOffDirectIndex = () => {
        const directController = new AbortController();
        if (externalSignal) {
          if (externalSignal.aborted) return;
          externalSignal.addEventListener("abort", () => directController.abort(), { once: true });
        }
        aborters.current.add(directController);
        const directOptions: FetchWithKeepAlive = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: directController.signal,
          keepalive: true,
        };
        fetch("/api/index_vault", directOptions)
          // TODO: Add client-side retry with backoff for direct indexing kickoff when appropriate.
          .catch((err) => {
            if (isAbortError(err)) return; // ignore aborts silently
            console.error("Direct indexing request failed", err);
          })
          .finally(() => {
            aborters.current.delete(directController);
          });
      };

      if (!sent) {
        // Fallback to fetch with keepalive; don't await, swallow errors
        const fetchOptions: FetchWithKeepAlive = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal,
          keepalive: true,
        };

        fetch("/api/indexing/enqueue", fetchOptions)
          // TODO: Implement client-side retry with jittered backoff for enqueue failures.
          .catch((err) => {
            if (isAbortError(err)) return; // ignore aborts silently
            console.error("Enqueue indexing request failed", err);
          })
          .finally(() => {
            aborters.current.delete(controller);
            inFlight.current.delete(dedupeKey);
          });
        kickOffDirectIndex();
      } else {
        aborters.current.delete(controller);
        inFlight.current.delete(dedupeKey);
        kickOffDirectIndex();
      }
    },
    []
  );

  return { indexVault, pending, error, success };
}
