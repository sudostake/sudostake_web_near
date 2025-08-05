import { NextResponse } from "next/server";

/**
 * Proxy JSON-RPC requests to NEAR Testnet to avoid CORS issues in the browser.
 */
export async function POST(request: Request) {
  const rpcRequest = await request.json();
  const rpcResponse = await fetch("https://rpc.testnet.near.org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rpcRequest),
  });
  const data = await rpcResponse.json();
  return NextResponse.json(data);
}
