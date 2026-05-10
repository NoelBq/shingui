import { Connection } from "@solana/web3.js";

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
