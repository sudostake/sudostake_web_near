import { providers } from "near-api-js";
import { base64Encode } from "@/utils/base64";
import type { CodeResult } from "@near-js/types";

/**
 * Type guard for NEAR RPC call_function response (CodeResult).
 */
function isCodeResult(res: unknown): res is CodeResult {
  return (
    typeof res === "object" &&
    res !== null &&
    "result" in res &&
    Array.isArray((res as CodeResult).result) &&
    "logs" in res &&
    Array.isArray((res as CodeResult).logs)
  );
}

// Standard RPC response wrapper: data on success, error message on failure
type RpcResult<T> = { data: T | null; error: string | null };

async function getVaultState(): Promise<RpcResult<unknown>> {
  const provider = new providers.JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  try {
    const res = await provider.query({
      request_type: "call_function",
      account_id: "vault-0.nzaza.testnet",
      method_name: "get_vault_state",
      args_base64: base64Encode(JSON.stringify({})),
      finality: "optimistic",
    });
    if (!isCodeResult(res)) {
      throw new Error(
        "RPC response does not contain expected CodeResult structure with result and logs arrays"
      );
    }
    const raw = res.result;
    const bytes = new Uint8Array(raw);
    const decoded = new TextDecoder().decode(bytes);
    const result = JSON.parse(decoded);
    return { data: result, error: null };
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export default async function Home() {
  const { data: vaultState, error } = await getVaultState();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">SudoStake</h1>
      </header>
      <main className="w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Vault State</h2>
        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 p-4 rounded">
          {error ?? JSON.stringify(vaultState, null, 2)}
        </pre>
      </main>
    </div>
  );
}
