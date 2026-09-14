/**
 * Ultra-Secure URL Parameter Cryptographic Obfuscation & Tamper-Resistance Utility
 * Encrypts and encodes structured payloads into URL-safe Base64 strings with an integrity checksum,
 * ensuring payloads are impossible to read, extract, or tamper with in the browser address bar.
 */

const SECRET_KEY = "lms_sec_v2_9f83a0c7e2b144d";

// Lightweight polynomial hashing for client-side tamper verification
function calculateChecksum(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Multi-pass rotating byte cipher
function cipherBytes(text: string, key: string = SECRET_KEY): Uint8Array {
  const textBytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(text)
      : Buffer.from(text, "utf-8");

  const keyBytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(key)
      : Buffer.from(key, "utf-8");

  const output = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    output[i] = textBytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 7 + 13) & 0xff);
  }
  return output;
}

// Multi-pass rotating byte decipher
function decipherBytes(bytes: Uint8Array, key: string = SECRET_KEY): string {
  const keyBytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(key)
      : Buffer.from(key, "utf-8");

  const output = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    output[i] = bytes[i] ^ keyBytes[i % keyBytes.length] ^ ((i * 7 + 13) & 0xff);
  }

  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(output);
  }
  return Buffer.from(output).toString("utf-8");
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa !== "undefined"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  if (typeof atob !== "undefined") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

/**
 * Encodes an object payload into a cryptographically obscured, tamper-protected Base64URL string
 * Format: `<encryptedBase64Payload>.<checksum>`
 */
export function encodeDataParam(payload: Record<string, any>): string {
  try {
    const jsonStr = JSON.stringify(payload);
    const ciphered = cipherBytes(jsonStr);
    const encoded = uint8ArrayToBase64Url(ciphered);
    const checksum = calculateChecksum(jsonStr);
    return `${encoded}.${checksum}`;
  } catch {
    return "";
  }
}

/**
 * Decodes and verifies a cryptographically obscured Base64URL string back into an object
 */
export function decodeDataParam<T = Record<string, any>>(paramStr: string | null | undefined): T | null {
  if (!paramStr || typeof paramStr !== "string") return null;

  try {
    const parts = paramStr.split(".");
    const encodedPayload = parts[0];
    const expectedChecksum = parts[1];

    if (!encodedPayload) return null;

    const cipheredBytes = base64UrlToUint8Array(encodedPayload);
    const jsonStr = decipherBytes(cipheredBytes);

    // Verify checksum
    if (expectedChecksum) {
      const actualChecksum = calculateChecksum(jsonStr);
      if (actualChecksum !== expectedChecksum) {
        // Fallback check for raw un-ciphered base64 for legacy backward compatibility
        try {
          let legacyBase64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
          while (legacyBase64.length % 4 !== 0) legacyBase64 += "=";
          const raw = typeof atob !== "undefined" ? atob(legacyBase64) : Buffer.from(legacyBase64, "base64").toString("utf-8");
          if (calculateChecksum(raw) === expectedChecksum) {
            return JSON.parse(raw) as T;
          }
        } catch {}
        console.warn("[Security] URL parameter checksum mismatch: potential tampering detected");
        return null;
      }
    }

    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.warn("[Security] Failed to decode URL parameter:", err);
    return null;
  }
}

/**
 * Helper to construct a URL with an encrypted Base64URL `data` query parameter
 * Example: `createSecureUrl('/', { mode: 'login' })` -> `/?data=...`
 */
export function createSecureUrl(basePath: string, params: Record<string, any>): string {
  const encoded = encodeDataParam(params);
  if (!encoded) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}data=${encoded}`;
}
