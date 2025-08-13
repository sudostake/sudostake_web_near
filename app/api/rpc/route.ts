import { NextResponse } from "next/server";
import { DEFAULT_NETWORK, SUPPORTED_NETWORKS, rpcUpstream } from "@/utils/networks";
import type { Network } from "@/utils/networks";

/**
 * Proxy JSON-RPC requests to the selected NEAR network to avoid CORS issues in the browser.
 *
 * The target network is chosen dynamically via the `?network=` query param
 * (supports values from SUPPORTED_NETWORKS). If absent or invalid, DEFAULT_NETWORK is used.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const requestedNetwork = url.searchParams.get("network")?.toLowerCase();

  // Type guard to narrow arbitrary strings to the Network union
  const isNetwork = (v: string | null | undefined): v is Network =>
    !!v && (SUPPORTED_NETWORKS as readonly string[]).includes(v);

  const network: Network = isNetwork(requestedNetwork)
    ? requestedNetwork
    : DEFAULT_NETWORK;

  const rpcRequest = await request.json();
  const rpcResponse = await fetch(rpcUpstream(network), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rpcRequest),
  });
  if (!rpcResponse.ok) {
    let errorBody: unknown;
    const responseClone = rpcResponse.clone();
    try {
      errorBody = await rpcResponse.json();
    } catch {
      errorBody = { error: await responseClone.text() };
    }
    return NextResponse.json(
      { error: "Upstream RPC error", details: errorBody },
      { status: 502 }
    );
  }
  const data = await rpcResponse.json();
  return NextResponse.json(data);
}
