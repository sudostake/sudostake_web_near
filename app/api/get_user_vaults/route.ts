import { NextResponse, type NextRequest } from "next/server";
import admin from "../../../utils/firebaseAdmin";

// Maps allowed vault suffixes to their RPC URLs
const FACTORY_CONTRACT_WHITELIST: Record<string, string> = {
  "nzaza.testnet": "https://rpc.testnet.fastnear.com",
  "sudostake.near": "https://rpc.mainnet.fastnear.com",
};

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
    return NextResponse.json(
      { error: "Missing 'owner' or 'factory_id' query parameter" },
      { status: 400 }
    );
  }

  if (!FACTORY_CONTRACT_WHITELIST[factoryId]) {
    return NextResponse.json(
      { error: "Unauthorized factory_id" },
      { status: 403 }
    );
  }

  const db = admin.firestore();
  try {
    const snapshot = await db
      .collection(factoryId)
      .where("owner", "==", owner)
      .get();

    const vaultIds = snapshot.docs.map((doc) => doc.id);
    return NextResponse.json(vaultIds);
  } catch (error) {
    console.error("Error fetching user vaults:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
