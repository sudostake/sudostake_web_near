import { type NextRequest } from "next/server";
import admin from "@/utils/firebaseAdmin";
import { jsonError, jsonOk, safeParseJson } from "@/utils/api/http";
import { FACTORY_CONTRACT_WHITELIST, isValidAccountId } from "@/utils/api/factory";
import { vaultDoc } from "@/utils/db/vaults";
import { transformVaultState } from "@/utils/transformers/transform_vault_state";
import type { RawVaultState } from "@/utils/types/raw_vault_state";
import type { VaultDocument } from "@/utils/types/vault_document";

export const runtime = "nodejs";

type IndexVaultBody = {
  factory_id: string;
  vault: string;
  tx_hash: string;
};

function getRpcUrl(factoryId: string): string | undefined {
  return FACTORY_CONTRACT_WHITELIST[factoryId];
}

function buildRpcRequest(accountId: string) {
  return {
    jsonrpc: "2.0",
    id: `idx-${Date.now()}`,
    method: "query",
    params: {
      request_type: "call_function",
      finality: "final",
      account_id: accountId,
      method_name: "get_vault_state",
      args_base64: Buffer.from(JSON.stringify({})).toString("base64"),
    },
  };
}

async function fetchRawVaultState(rpcUrl: string, accountId: string): Promise<RawVaultState> {
  const rpcReq = buildRpcRequest(accountId);
  const rpcRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rpcReq),
  });
  if (!rpcRes.ok) {
    let details: unknown;
    try {
      details = await rpcRes.json();
    } catch {
      details = await rpcRes.text();
    }
    throw new Error(`RPC error: ${JSON.stringify(details)}`);
  }

  const rpcData = await rpcRes.json();
  const bytes: unknown = rpcData?.result?.result;
  if (!Array.isArray(bytes)) {
    console.error("Unexpected RPC response format:", rpcData);
    throw new Error(`Unexpected RPC response format: ${JSON.stringify(rpcData)}`);
  }
  const json = Buffer.from(Uint8Array.from(bytes)).toString("utf8");
  return JSON.parse(json) as RawVaultState;
}

function validateInputs(
  factoryId: string | null,
  vault: string | null,
  txHash: string | null
): { ok: true; rpcUrl: string } | { ok: false; message: string; status: number } {
  if (!factoryId || !vault || !txHash)
    return { ok: false, message: "Missing required fields: factory_id, vault, tx_hash", status: 400 };
  const rpcUrl = getRpcUrl(factoryId);
  if (!rpcUrl) return { ok: false, message: "Unauthorized factory_id", status: 403 };
  if (!isValidAccountId(vault)) return { ok: false, message: "Invalid vault account id", status: 400 };
  if (!vault.endsWith(`.${factoryId}`))
    return { ok: false, message: "Vault account id does not belong to factory_id", status: 400 };
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

async function persistIndexedVault(
  factoryId: string,
  vault: string,
  transformed: ReturnType<typeof transformVaultState>,
  txHash: string
) {
  const docRef = vaultDoc(factoryId, vault);
  const toWrite: VaultDocument = {
    ...transformed,
    factory_id: factoryId,
    tx_hash: txHash,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };
  await docRef.set(toWrite);
}

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

  const transformed = transformVaultState(rawState);

  try {
    await persistIndexedVault(factoryId, vault, transformed, txHash);
  } catch (error: unknown) {
    console.error("Failed to index vault:", error);
    const details = error instanceof Error ? error.message : error;
    return jsonError("Failed to index vault", 500, details);
  }

  return jsonOk();
}
