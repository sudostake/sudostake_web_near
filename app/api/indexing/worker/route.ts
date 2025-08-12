import { NextRequest } from "next/server";
import {
  claimNextJob,
  markJobFailed,
  markJobSucceeded,
  timestampFromDate,
} from "@/utils/db/indexing_jobs";
import { getRpcUrl, fetchRawVaultState, persistIndexedVault } from "@/utils/indexing/service";
import { jsonOk } from "@/utils/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function computeBackoffSeconds(attempts: number): number {
  // Exponential backoff with jitter: base 2^attempts seconds, cap at ~5 minutes
  const base = Math.min(300, Math.pow(2, Math.max(1, attempts)));
  const jitter = Math.random() * Math.min(30, base * 0.25);
  return Math.floor(base + jitter);
}

type ProcessResult =
  | { picked: false; error?: string }
  | { picked: true; job: string; result: "succeeded" }
  | { picked: true; job: string; result: "failed"; error: string }
  | { picked: true; job: string; result: "failed_unknown_factory" };

function isSucceeded(
  r: ProcessResult
): r is Extract<ProcessResult, { picked: true; result: "succeeded" }> {
  return r.picked === true && "result" in r && r.result === "succeeded";
}

function isFailed(
  r: ProcessResult
): r is Extract<ProcessResult, { picked: true; result: "failed" }> {
  return r.picked === true && "result" in r && r.result === "failed";
}

async function processOne(): Promise<ProcessResult> {
  const claimed = await claimNextJob({ maxAttempts: 6, leaseSeconds: 60 });
  if (!claimed) return { picked: false as const };

  const job = claimed.data();
  const rpcUrl = getRpcUrl(job.factory_id);
  if (!rpcUrl) {
    // Should not happen due to input validation on enqueue, but mark failed permanently
    await markJobFailed(
      claimed.ref,
      `Unauthorized or unknown factory_id: ${job.factory_id}`,
      timestampFromDate(new Date(Date.now() + 24 * 3600 * 1000))
    );
    return { picked: true as const, job: job.id, result: "failed_unknown_factory" as const };
  }

  try {
    const raw = await fetchRawVaultState(rpcUrl, job.vault);
    await persistIndexedVault(job.factory_id, job.vault, raw, job.tx_hash);
    await markJobSucceeded(claimed.ref);
    return { picked: true as const, job: job.id, result: "succeeded" as const };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const backoffSec = computeBackoffSeconds((job.attempts ?? 0) + 1);
    const nextRun = new Date(Date.now() + backoffSec * 1000);
    await markJobFailed(claimed.ref, msg, timestampFromDate(nextRun));
    return { picked: true as const, job: job.id, result: "failed" as const, error: msg };
  }
}

async function processBatch(maxJobs: number) {
  const results: ProcessResult[] = [];
  for (let i = 0; i < Math.max(1, Math.min(25, maxJobs)); i++) {
    try {
      const res = await processOne();
      results.push(res);
      if (!res.picked) break;
    } catch (e) {
      results.push({ picked: false, error: e instanceof Error ? e.message : String(e) });
      break;
    }
  }
  const picked = results.filter((r) => r.picked).length;
  const succeeded = results.filter(isSucceeded).length;
  const failed = results.filter(isFailed).length;
  const summary = { picked, succeeded, failed, details: results };
  return summary;
}

export async function GET(req: NextRequest) {
  const max = Number(req.nextUrl.searchParams.get("max") ?? "1");
  const res = await processBatch(Number.isFinite(max) ? max : 1);
  return jsonOk(res);
}

export async function POST(req: NextRequest) {
  const max = Number(req.nextUrl.searchParams.get("max") ?? "1");
  const res = await processBatch(Number.isFinite(max) ? max : 1);
  return jsonOk(res);
}
