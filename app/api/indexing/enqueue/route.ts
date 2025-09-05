import { type NextRequest } from "next/server";
import { jsonError, jsonOk, safeParseJson } from "@/utils/api/http";
import { validateFactoryAndVault } from "@/utils/indexing/service";
import { getAdmin } from "@/utils/firebaseAdmin";
import { jobDoc, serverNow } from "@/utils/db/indexing_jobs";

type EnqueueBody = {
  factory_id: string;
  vault: string;
  tx_hash?: string;
};

export async function POST(req: NextRequest) {
  const parsed = await safeParseJson<EnqueueBody>(req);
  if (!parsed.ok) return parsed.response;
  const { factory_id, vault, tx_hash } = parsed.data;

  const valid = validateFactoryAndVault(factory_id, vault);
  if (!valid.ok) return jsonError(valid.message, valid.status);

  const docRef = jobDoc(factory_id, vault);
  const db = getAdmin().firestore();
  const queued = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (snap.exists) {
      const data = snap.data()!;
      if (data.status === "succeeded") {
        return false; // already done, do not modify
      }
    }
    const payload: Record<string, unknown> = {
      id: docRef.id,
      factory_id,
      vault,
      status: "pending",
      attempts: 0,
      created_at: serverNow(),
      updated_at: serverNow(),
    };
    if (tx_hash !== undefined) payload.tx_hash = tx_hash;
    tx.set(docRef, payload, { merge: true });
    return true;
  });

  return jsonOk({ queued });
}
