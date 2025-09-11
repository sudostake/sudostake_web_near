import { type NextRequest } from "next/server";
import { FACTORY_CONTRACT_WHITELIST } from "@/utils/api/factory";
import { jsonError, jsonOk } from "@/utils/api/http";
import { vaultsCollection } from "@/utils/db/vaults";

// GET /api/view_lender_positions?factory_id=<factoryId>&lender_id=<accountId>
// Returns an array of vault documents the lender has positions in, ordered by acceptance time desc.
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const factoryId = searchParams.get("factory_id");
  const lenderId = searchParams.get("lender_id");

  if (!factoryId) return jsonError("Missing 'factory_id' query parameter", 400);
  if (!FACTORY_CONTRACT_WHITELIST[factoryId]) return jsonError("Unauthorized factory_id", 403);
  if (!lenderId) return jsonError("Missing 'lender_id' query parameter", 400);

  try {
    const snapshot = await vaultsCollection(factoryId)
      .where("accepted_offer.lender", "==", lenderId)
      .orderBy("accepted_offer.accepted_at", "desc")
      .get();

    const lenderPositions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return jsonOk(lenderPositions);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : error;
    console.error("Failed to fetch lender positions:", error);
    return jsonError("Internal error", 500, details);
  }
}

