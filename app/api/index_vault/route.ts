import { type NextRequest } from "next/server";
import { jsonError, jsonOk, safeParseJson } from "@/utils/api/http";
import type { RawVaultState } from "@/utils/types/raw_vault_state";
import {
  fetchRawVaultState,
  getRpcUrl,
  persistIndexedVault,
  validateFactoryAndVault,
} from "@/utils/indexing/service";

export const runtime = "nodejs";

type IndexVaultBody = {
  factory_id: string;
  vault: string;
  tx_hash: string;
};


function validateInputs(
  factoryId: string | null,
  vault: string | null,
  txHash: string | null
): { ok: true; rpcUrl: string } | { ok: false; message: string; status: number } {
  if (!factoryId || !vault || !txHash)
    return { ok: false, message: "Missing required fields: factory_id, vault, tx_hash", status: 400 };
  const rpcUrl = getRpcUrl(factoryId);
  const base = validateFactoryAndVault(factoryId, vault);
  if (!rpcUrl || !base.ok) return { ok: false, message: base.ok ? "Unauthorized factory_id" : base.message, status: base.ok ? 403 : base.status };
  return { ok: true, rpcUrl };
}

// After validation succeeds, txHash is guaranteed to be a string
type Validated = { factoryId: string; vault: string; txHash: string; rpcUrl: string };

async function parseAndValidate(req: NextRequest): Promise<
  | { ok: true; data: Validated }
  | { ok: false; response: Response }
> {
  const parsed = await safeParseJson<IndexVaultBody>(req);
  if (!parsed.ok) return { ok: false, response: parsed.response };

  const { factory_id, vault, tx_hash } = parsed.data;
  const validated = validateInputs(factory_id, vault, tx_hash ?? null);
  if (!validated.ok) return { ok: false, response: jsonError(validated.message, validated.status) };

  const { rpcUrl } = validated;
  return {
    ok: true,
    data: {
      factoryId: factory_id,
      vault: vault,
      txHash: tx_hash,
      rpcUrl,
    },
  };
}

// persist function moved to utils/indexing/service.ts

export async function POST(req: NextRequest) {
  const validated = await parseAndValidate(req);
  if (!validated.ok) return validated.response;

  const { factoryId, vault, txHash, rpcUrl } = validated.data;

  let rawState: RawVaultState;
  try {
    rawState = await fetchRawVaultState(rpcUrl, vault);
  } catch (error: unknown) {
    console.error("Failed to fetch vault state from chain:", error);
    const details = error instanceof Error ? error.message : error;
    return jsonError("Failed to fetch vault state from chain", 502, details);
  }

  try {
    await persistIndexedVault(factoryId, vault, rawState, txHash);
  } catch (error: unknown) {
    console.error("Failed to index vault:", error);
    const details = error instanceof Error ? error.message : error;
    return jsonError("Failed to index vault", 500, details);
  }

  return jsonOk();
}
