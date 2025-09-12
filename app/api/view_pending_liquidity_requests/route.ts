import { type NextRequest } from "next/server";
import { FACTORY_CONTRACT_WHITELIST } from "@/utils/api/factory";
import { jsonError, jsonOk } from "@/utils/api/http";
import { vaultsCollection } from "@/utils/db/vaults";

// GET /api/view_pending_liquidity_requests?factory_id=<factoryId>[&limit=<n>]
// Returns vault documents with an open (pending) liquidity request.
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const factoryId = searchParams.get("factory_id");

  if (!factoryId) return jsonError("Missing 'factory_id' query parameter", 400);
  if (!FACTORY_CONTRACT_WHITELIST[factoryId]) return jsonError("Unauthorized factory_id", 403);

  // Optional limit to cap results (defaults to no cap, but we bound to 500 max if provided)
  const limitParam = Number(searchParams.get("limit") ?? "0");
  const hasLimit = Number.isFinite(limitParam) && Number.isInteger(limitParam) && limitParam > 0;
  const limit = hasLimit ? Math.min(limitParam, 500) : undefined;

  try {
    let query = vaultsCollection(factoryId).where("state", "==", "pending");
    if (limit !== undefined) query = query.limit(limit);

    const snapshot = await query.get();
    const pendingVaults = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return jsonOk(pendingVaults);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : error;
    console.error("Failed to fetch pending liquidity requests:", error);
    return jsonError("Internal error", 500, details);
  }
}

