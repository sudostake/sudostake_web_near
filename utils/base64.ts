/**
 * Encode a UTF-8 string into base64 without Node Buffer.
 * Uses TextEncoder to get UTF-8 bytes, then maps each byte (0–255)
 * to a Latin-1 character so that btoa correctly encodes the raw bytes.
 */
export function base64Encode(str: string): string {
  const uint8 = new TextEncoder().encode(str);
  const binary = Array.from(uint8, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

/**
 * Decode a base64-encoded Latin-1 string back into UTF-8.
 * atob produces a Latin-1 string of raw bytes, which are reassembled
 * into a Uint8Array and decoded via TextDecoder to get the original text.
 */
export function base64Decode(b64: string): string {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
