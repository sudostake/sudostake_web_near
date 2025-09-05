import { FACTORY_CONTRACT_WHITELIST, isValidAccountId } from "@/utils/api/factory";
import type { VaultViewState } from "@/utils/types/vault_view_state";
import { transformVaultState } from "@/utils/transformers/transform_vault_state";
import type { VaultDocument } from "@/utils/types/vault_document";
import { getAdmin } from "@/utils/firebaseAdmin";
import { vaultDoc } from "@/utils/db/vaults";

export function getRpcUrl(factoryId: string): string | undefined {
  return FACTORY_CONTRACT_WHITELIST[factoryId];
}

export function validateFactoryAndVault(
  factoryId: string | null | undefined,
  vault: string | null | undefined
): { ok: true } | { ok: false; message: string; status: number } {
  if (!factoryId || !vault) return { ok: false, message: "Missing required fields: factory_id, vault", status: 400 };
  const rpcUrl = getRpcUrl(factoryId);
  if (!rpcUrl) return { ok: false, message: "Unauthorized factory_id", status: 403 };
  if (!isValidAccountId(vault)) return { ok: false, message: "Invalid vault account id", status: 400 };
  if (!vault.endsWith(`.${factoryId}`))
    return { ok: false, message: "Vault account id does not belong to factory_id", status: 400 };
  return { ok: true };
}

function buildRpcRequest(accountId: string, finality: "final" | "optimistic" = "optimistic") {
  return {
    jsonrpc: "2.0",
    id: `idx-${Date.now()}`,
    method: "query",
    params: {
      request_type: "call_function",
      finality,
      account_id: accountId,
      method_name: "get_vault_state",
      args_base64: Buffer.from(JSON.stringify({})).toString("base64"),
    },
  };
}

export async function fetchVaultViewState(rpcUrl: string, accountId: string): Promise<VaultViewState> {
  const maxAttempts = 6;
  const baseDelayMs = 300;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const finality of ["optimistic", "final"] as const) {
      const rpcReq = buildRpcRequest(accountId, finality);
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
        throw new Error(`RPC HTTP error: ${JSON.stringify(details)}`);
      }
      const rpcData = await rpcRes.json();
      if (rpcData?.error) {
        const name: string | undefined = rpcData.error?.cause?.name ?? rpcData.error?.name;
        const message: string | undefined = rpcData.error?.data ?? rpcData.error?.message;
        const shouldRetry =
          name === "UNKNOWN_ACCOUNT" ||
          (typeof message === "string" && /does not exist while viewing/i.test(message));
        if (shouldRetry && attempt < maxAttempts) {
          const delay = baseDelayMs * attempt;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(
          `RPC error (${name ?? "UNKNOWN"}): ${typeof message === "string" ? message : JSON.stringify(
            rpcData.error
          )}`
        );
      }
      const bytes: unknown = rpcData?.result?.result;
      if (Array.isArray(bytes)) {
        const json = Buffer.from(Uint8Array.from(bytes)).toString("utf8");
        return JSON.parse(json) as VaultViewState;
      }
      console.error("Unexpected RPC response format:", rpcData);
      throw new Error(`Unexpected RPC response format`);
    }
  }
  throw new Error("Vault account not found or not yet readable after multiple attempts");
}

export async function persistIndexedVault(
  factoryId: string,
  vault: string,
  viewState: VaultViewState,
  txHash?: string
) {
  const transformed = transformVaultState(viewState);
  const docRef = vaultDoc(factoryId, vault);
  const toWrite: VaultDocument = {
    ...transformed,
    factory_id: factoryId,
    // tx hash is not part of the on-chain vault state; persist the provided hash if supplied
    tx_hash: txHash ?? null,
    created_at: getAdmin().firestore.FieldValue.serverTimestamp(),
    updated_at: getAdmin().firestore.FieldValue.serverTimestamp(),
  };
  await docRef.set(toWrite);
}
