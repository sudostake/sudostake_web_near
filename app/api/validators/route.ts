import { NextResponse, NextRequest } from "next/server";

/**
 * Returns the default validators for delegation (e.g. testnet defaults).
 * This endpoint allows the UI to fetch an updatable list of default validators.
 */
import type { Network } from "@/utils/networks";

// Default validators by network (allows updating per network)
const DEFAULT_VALIDATORS: Record<Network, string[]> = {
  testnet: [
    "kiln.pool.f863973.m0",
    "aurora.pool.f863973.m0",
  ],
  mainnet: [],
};

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("network");
  const network = q === "mainnet" || q === "testnet" ? (q as Network) : "testnet";
  const validators = DEFAULT_VALIDATORS[network] ?? [];
  return NextResponse.json(validators);
}
