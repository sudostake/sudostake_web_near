import { getActiveNetwork, rpcPath, type Network, FACTORY_CONTRACTS } from "@/utils/networks";
import { base64Encode } from "@/utils/base64";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params: unknown;
};

type JsonRpcResponse<T = unknown> = {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
};

export function networkFromFactoryId(factoryId?: string | null): Network {
  if (!factoryId) return getActiveNetwork();
  const { testnet, mainnet } = FACTORY_CONTRACTS;
  if (factoryId === testnet) return "testnet";
  if (factoryId === mainnet) return "mainnet";
  // Fallback to current active network
  return getActiveNetwork();
}

export async function callViewFunction<T = unknown>(
  accountId: string,
  methodName: string,
  args: Record<string, unknown> = {},
  opts?: { network?: Network; id?: string | number }
): Promise<T> {
  const network = opts?.network ?? getActiveNetwork();
  const id = opts?.id ?? `rpc-${Date.now()}`;

  const body: JsonRpcRequest = {
    jsonrpc: "2.0",
    id,
    method: "query",
    params: {
      request_type: "call_function",
      finality: "optimistic",
      account_id: accountId,
      method_name: methodName,
      args_base64: base64Encode(JSON.stringify(args)),
    },
  };

  const res = await fetch(rpcPath(network), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC error (${res.status}): ${text}`);
  }

  const data: JsonRpcResponse<{ result?: number[] }> = await res.json();
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  const bytes = data.result?.result;
  if (!bytes || !Array.isArray(bytes)) {
    throw new Error("Unexpected RPC response: missing result bytes");
  }

  const decoder = new TextDecoder();
  const json = decoder.decode(Uint8Array.from(bytes));
  return JSON.parse(json) as T;
}

