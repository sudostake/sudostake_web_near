import { NextResponse } from "next/server";

/**
 * Proxy JSON-RPC requests to NEAR Testnet to avoid CORS issues in the browser.
 */
export async function POST(request: Request) {
  const rpcRequest = await request.json();
  const rpcResponse = await fetch("https://rpc.testnet.fastnear.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rpcRequest),
  });
  if (!rpcResponse.ok) {
    let errorBody: unknown;
    try {
      errorBody = await rpcResponse.json();
    } catch {
      errorBody = { error: await rpcResponse.text() };
    }
    return NextResponse.json(
      { error: "Upstream RPC error", details: errorBody },
      { status: 502 }
    );
  }
  const data = await rpcResponse.json();
  return NextResponse.json(data);
}
