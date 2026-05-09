// Canonical JSON serialization + sha256 hashing.
//
// Two payloads that differ only in object key order or whitespace must
// produce the same hash. Without this, a verifier comparing
// sha256(JSON.stringify(currentPayload)) against the committed hash
// would flag false tampers from any non-deterministic re-serialization
// (e.g. JS engines preserving insertion order, Postgres jsonb returning
// keys in storage order rather than insertion order, etc.).
//
// Subset rules:
//   - object keys sorted lexicographically (UTF-16 code unit order, what
//     Array.prototype.sort uses by default)
//   - no whitespace
//   - non-finite numbers (NaN/Infinity) throw — JSON cannot represent them
//   - undefined values throw — JSON has no undefined
//   - arrays preserve order (order IS semantically meaningful)
//   - strings use the standard JSON.stringify escaping
//
// Anything outside JSON's value model (functions, symbols, Map, Set,
// BigInt, Date) throws. Convert to plain JSON before hashing.

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`canonicalJson: non-finite number ${value}`);
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts: string[] = [];
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined) {
        throw new Error(`canonicalJson: undefined value at key "${k}"`);
      }
      parts.push(JSON.stringify(k) + ":" + canonicalJson(v));
    }
    return "{" + parts.join(",") + "}";
  }
  throw new Error(`canonicalJson: unsupported type ${typeof value}`);
}

export async function hashPayloadBytes(payload: unknown): Promise<Uint8Array> {
  const canonical = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canonical);
  // TextEncoder always allocates a fresh ArrayBuffer (never SharedArrayBuffer),
  // so the cast is sound. Strict TS otherwise rejects ArrayBufferLike for
  // the BufferSource argument.
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes.buffer as ArrayBuffer,
  );
  return new Uint8Array(digest);
}

export async function hashPayloadHex(payload: unknown): Promise<string> {
  const bytes = await hashPayloadBytes(payload);
  return bytesToHex(bytes);
}

export function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("hexToBytes: hex string must have even length");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
