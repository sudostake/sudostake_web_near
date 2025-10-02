"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dialogs/Modal";
import { Button } from "@/app/components/ui/Button";

export type IndexingJob = {
  factoryId: string;
  vault: string;
  txHash: string;
  lastError?: string;
};

type Ctx = {
  job: IndexingJob | null;
  setFailedJob: (job: IndexingJob) => void;
  clearJobIfMatch: (job: { factoryId: string; vault: string; txHash: string }) => void;
};

const IndexingBlockerContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "indexing:blocker:job";

export function IndexingBlockerProvider({ children }: { children: React.ReactNode }) {
  const [job, setJob] = useState<IndexingJob | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as IndexingJob;
        setJob(parsed);
        setLastError(parsed.lastError);
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  const persistJob = useCallback((next: IndexingJob | null) => {
    try {
      if (typeof window === "undefined") return;
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const setFailedJob = useCallback((failed: IndexingJob) => {
    setJob(failed);
    setLastError(failed.lastError);
    persistJob(failed);
  }, [persistJob]);

  const clearJobIfMatch = useCallback((needle: { factoryId: string; vault: string; txHash: string }) => {
    setJob((curr) => {
      if (curr && curr.factoryId === needle.factoryId && curr.vault === needle.vault && curr.txHash === needle.txHash) {
        persistJob(null);
        setLastError(undefined);
        return null;
      }
      return curr;
    });
  }, [persistJob]);

  const ctxValue = useMemo<Ctx>(() => ({ job, setFailedJob, clearJobIfMatch }), [job, setFailedJob, clearJobIfMatch]);

  const retry = useCallback(async () => {
    if (!job || retrying) return;
    setRetrying(true);
    setLastError(undefined);
    try {
      const res = await fetch("/api/index_vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factory_id: job.factoryId, vault: job.vault, tx_hash: job.txHash }),
        keepalive: true,
      });
      if (!res.ok) {
        let details: string | undefined;
        try {
          const j = await res.json();
          details = typeof j?.error === "string" ? j.error : j?.message ?? JSON.stringify(j);
        } catch {
          details = await res.text();
        }
        const message = details ? `Indexing failed: ${details}` : `Indexing failed with status ${res.status}`;
        setLastError(message);
        const updated: IndexingJob = { ...job, lastError: message };
        setJob(updated);
        persistJob(updated);
        return;
      }
      // success
      setJob(null);
      setLastError(undefined);
      persistJob(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setLastError(message);
      const updated: IndexingJob = { ...job, lastError: message };
      setJob(updated);
      persistJob(updated);
    } finally {
      setRetrying(false);
    }
  }, [job, persistJob, retrying]);

  return (
    <IndexingBlockerContext.Provider value={ctxValue}>
      {children}
      <Modal
        open={!!job}
        onClose={() => {}}
        title="Action pending: Index vault"
        disableBackdropClose
        showClose={false}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button onClick={retry} disabled={retrying}>
              {retrying ? "Indexing..." : "Retry indexing"}
            </Button>
          </div>
        }
      >
        {job ? (
          <div className="space-y-2">
            <p className="text-sm text-secondary-text">We could not index your latest action for this vault. The app will remain blocked until indexing succeeds.</p>
            <div className="text-sm">
              <div>
                Vault: <span className="font-mono" title={job.vault}>{job.vault}</span>
              </div>
              <div className="truncate">
                Tx: <span className="font-mono" title={job.txHash}>{job.txHash}</span>
              </div>
            </div>
            {lastError && (
              <div className="text-xs text-red-500 break-words">
                {lastError}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </IndexingBlockerContext.Provider>
  );
}

export function useIndexingBlocker(): Ctx {
  const ctx = useContext(IndexingBlockerContext);
  if (!ctx) throw new Error("useIndexingBlocker must be used within IndexingBlockerProvider");
  return ctx;
}
