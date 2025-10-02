/**
 * Map raw errors to user-friendly messages.
 */
export function getFriendlyErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    // Customize known error messages here if needed.
    return e.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/**
 * Detect whether an error corresponds to an aborted fetch/request.
 * Normalizes across environments (DOMException, Error.name, polyfills).
 */
export function isAbortError(e: unknown): boolean {
  // DOMException with name AbortError (browser)
  if (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") return true;
  // Generic Error with name AbortError (some runtimes/polyfills)
  if (e instanceof Error && e.name === "AbortError") return true;
  // Fallback: loose shape check for objects that carry a name only
  if (typeof e === "object" && e !== null && "name" in e) {
    const n = (e as { name?: unknown }).name;
    if (typeof n === "string" && n === "AbortError") return true;
  }
  return false;
}

/**
 * Extract a human-readable error message from a failed fetch Response.
 * Falls back to response text, then status code if JSON parsing fails.
 */
export async function extractResponseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    const msg = (j as any)?.error;
    if (typeof msg === "string") return msg;
    const alt = (j as any)?.message;
    if (typeof alt === "string") return alt;
    return JSON.stringify(j);
  } catch {
    try {
      const t = await res.text();
      return t || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }
}
