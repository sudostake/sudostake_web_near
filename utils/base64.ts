export function base64Encode(str: string): string {
  const uint8 = new TextEncoder().encode(str);
  const binary = Array.from(uint8, byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

export function base64Decode(b64: string): string {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
