import { NextResponse, type NextRequest } from "next/server";

export function jsonError(message: string, status = 400, details?: unknown) {
  const body = details ? { error: message, details } : { error: message };
  return NextResponse.json(body, { status });
}

export function jsonOk(data?: unknown) {
  return NextResponse.json(data ?? { ok: true });
}

export async function safeParseJson<T>(
  req: NextRequest
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }
}

