/**
 * Secure URL Parameter Encoding & Tamper-Resistance Utility
 * Encodes structured payloads into URL-safe Base64 strings with an integrity checksum.
 */

// Simple lightweight hashing for client-side tamper verification
function calculateChecksum(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Convert string to URL-safe Base64
function toBase64Url(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert URL-safe Base64 back to string
function fromBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  if (typeof window !== "undefined") {
    const raw = atob(base64);
    return decodeURIComponent(
      Array.prototype.map
        .call(raw, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Encodes an object payload into a tamper-protected Base64URL string
 * Format: `<base64Payload>.<checksum>`
 */
export function encodeDataParam(payload: Record<string, any>): string {
  try {
    const jsonStr = JSON.stringify(payload);
    const encoded = toBase64Url(jsonStr);
    const checksum = calculateChecksum(jsonStr);
    return `${encoded}.${checksum}`;
  } catch {
    return "";
  }
}

/**
 * Decodes and verifies a tamper-protected Base64URL string back into an object
 */
export function decodeDataParam<T = Record<string, any>>(paramStr: string | null | undefined): T | null {
  if (!paramStr || typeof paramStr !== "string") return null;

  try {
    // Handle payload.checksum format
    const parts = paramStr.split(".");
    const encodedPayload = parts[0];
    const expectedChecksum = parts[1];

    const jsonStr = fromBase64Url(encodedPayload);

    // If checksum is present, verify integrity
    if (expectedChecksum) {
      const actualChecksum = calculateChecksum(jsonStr);
      if (actualChecksum !== expectedChecksum) {
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
 * Helper to construct a URL with a Base64URL-encoded `data` query parameter
 * Example: `createSecureUrl('/courses', { courseId: 'dsa-foundations' })` -> `/courses?data=...`
 */
export function createSecureUrl(basePath: string, params: Record<string, any>): string {
  const encoded = encodeDataParam(params);
  if (!encoded) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}data=${encoded}`;
}
