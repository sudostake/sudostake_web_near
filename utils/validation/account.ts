export function isValidAccountId(id: string): boolean {
  if (typeof id !== "string") return false;
  if (id.length < 2 || id.length > 64) return false;

  // Implicit account: 64-char hex (ed25519 public key hash)
  if (/^[0-9a-f]{64}$/.test(id)) return true;

  const parts = id.split(".");
  if (parts.length === 0) return false;

  const labelRe = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])$/;
  return parts.every((p) => p.length >= 2 && p.length <= 64 && labelRe.test(p));
}

