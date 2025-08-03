import { providers } from "near-api-js";
import { Buffer } from "buffer";

async function getVaultState() {
  const provider = new providers.JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  try {
    const res = await provider.query({
      request_type: "call_function",
      account_id: "vault-0.nzaza.testnet",
      method_name: "get_vault_state",
      args_base64: Buffer.from(JSON.stringify({})).toString("base64"),
      finality: "optimistic",
    });
    const raw = (res as unknown as { result: Uint8Array }).result;
    return JSON.parse(Buffer.from(raw).toString());
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export default async function Home() {
  const vaultState = await getVaultState();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">SudoStake</h1>
      </header>
      <main className="w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Vault State</h2>
        <pre className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 p-4 rounded">
          {JSON.stringify(vaultState, null, 2)}
        </pre>
      </main>
    </div>
  );
}
