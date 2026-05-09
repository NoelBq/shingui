import { Connection, Keypair } from "@solana/web3.js";

// Server-side first (private endpoint), then public (browser-safe), then
// devnet default. NEXT_PUBLIC_* is intentionally readable on both sides
// so the wallet adapter and the server route hit the same cluster.
export function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.devnet.solana.com"
  );
}

export function getRpcConnection(): Connection {
  return new Connection(getRpcUrl(), "confirmed");
}

// Loads the admin keypair from SHINGI_ADMIN_KEYPAIR. Format is the
// JSON-array-of-bytes that `solana-keygen new` emits. This signs the
// commit_memory transactions emitted by the seed-memories admin route.
export function loadAdminKeypair(): Keypair {
  const raw = process.env.SHINGI_ADMIN_KEYPAIR;
  if (!raw) {
    throw new Error(
      "SHINGI_ADMIN_KEYPAIR is not set. Generate with `solana-keygen new -o /tmp/admin.json --no-bip39-passphrase --silent` then paste the file contents into .env.local as SHINGI_ADMIN_KEYPAIR='[...]'.",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "SHINGI_ADMIN_KEYPAIR is not valid JSON. Expected a JSON array of 64 bytes.",
    );
  }
  if (!Array.isArray(parsed) || parsed.length !== 64) {
    throw new Error(
      `SHINGI_ADMIN_KEYPAIR must be a JSON array of 64 bytes, got ${
        Array.isArray(parsed) ? `array of ${parsed.length}` : typeof parsed
      }.`,
    );
  }
  return Keypair.fromSecretKey(Uint8Array.from(parsed as number[]));
}
