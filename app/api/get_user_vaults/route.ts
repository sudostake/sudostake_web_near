import { type NextRequest } from "next/server";
import { FACTORY_CONTRACT_WHITELIST } from "@/utils/api/factory";
import { jsonError, jsonOk } from "@/utils/api/http";
import { vaultsCollection } from "@/utils/db/vaults";

/**
 * GET /api/get_user_vaults?owner=<owner>&factory_id=<factoryId>
 * Returns an array of vault IDs owned by the given user under the specified factory.
 */
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const factoryId = searchParams.get("factory_id");

  if (!owner || !factoryId) {
    return jsonError("Missing 'owner' or 'factory_id' query parameter", 400);
  }

  if (!FACTORY_CONTRACT_WHITELIST[factoryId]) {
    return jsonError("Unauthorized factory_id", 403);
  }

  try {
    const snapshot = await vaultsCollection(factoryId)
      .where("owner", "==", owner)
      .get();

    const vaultIds = snapshot.docs.map((doc) => doc.id);
    return jsonOk(vaultIds);
  } catch (error) {
    console.error("Error fetching user vaults:", error);
    return jsonError("Failed to fetch user vaults from database", 500);
  }
}
