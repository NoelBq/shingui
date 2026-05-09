import "server-only";

import { bytesToHex, hashPayloadBytes } from "./hash";
import {
  decodeCommitMemoryFromTx,
  SHINGI_PROGRAM_ID,
} from "./program";
import { getRpcConnection } from "./connection";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryEvent, VerifyResult } from "@/types";

// Threshold above which we flag the agent's self-reported `recorded_at`
// as suspiciously divergent from consensus block_time. Hackathon default;
// real systems should pick this based on expected commit latency.
const TIMESTAMP_DIVERGENCE_THRESHOLD_SECONDS = 60;

export interface VerifyMemoryRow extends VerifyResult {
  event: MemoryEvent;
}

// Recomputes the hash from the payload as it currently exists in
// Postgres, fetches the onchain tx, decodes the committed hash from the
// instruction data, and returns the comparison result.
//
// The point of recomputing every time: the operator can mutate `payload`
// in Postgres at will. A stored hash would just be another mutable field.
// Trusting the onchain tx is the entire security claim.
export async function verifyMemory(
  memoryEventId: string,
): Promise<VerifyMemoryRow | null> {
  const sb = getServerSupabase() ?? getServiceSupabase();
  if (!sb) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (and SUPABASE_SERVICE_ROLE_KEY for the seed/tamper routes).",
    );
  }

  const { data, error } = await sb
    .from("memory_events")
    .select("id, agent_id, payload, solana_tx_sig, created_at")
    .eq("id", memoryEventId)
    .maybeSingle();
  if (error) {
    throw new Error(`verifyMemory: query failed: ${error.message}`);
  }
  if (!data) return null;

  const event = data as MemoryEvent;
  const payload = event.payload;

  const computedBytes = await hashPayloadBytes(payload);
  const computedHash = bytesToHex(computedBytes);

  const connection = getRpcConnection();

  let onchainHash: string | null = null;
  let blockTime: number | null = null;
  let signer: string | null = null;

  try {
    const decoded = await decodeCommitMemoryFromTx(
      connection,
      event.solana_tx_sig,
    );
    onchainHash = bytesToHex(decoded.decoded.hash);
    blockTime = decoded.blockTime;
    signer = decoded.signer?.toBase58() ?? null;
  } catch (e) {
    // We still return a VerifyResult — but `ok` will be false because
    // onchainHash is null. The page surfaces the underlying error so a
    // verifier can tell "RPC down" apart from "tampered".
    return {
      event,
      ok: false,
      computedHash,
      onchainHash: null,
      blockTime: null,
      signer: null,
      txSig: event.solana_tx_sig,
      timestampDivergenceSeconds: null,
      // Stash the error message in the type's index signature; the page
      // can surface it without changing the public shape.
      ...({
        rpcError:
          e instanceof Error ? e.message : "unknown error fetching tx",
      } as object),
    } as VerifyMemoryRow & { rpcError: string };
  }

  const ok = onchainHash === computedHash;

  let timestampDivergenceSeconds: number | null = null;
  const recordedAt = payload.recorded_at;
  if (typeof recordedAt === "string" && blockTime !== null) {
    const recordedSec = Math.floor(new Date(recordedAt).getTime() / 1000);
    if (Number.isFinite(recordedSec)) {
      const diff = Math.abs(recordedSec - blockTime);
      if (diff > TIMESTAMP_DIVERGENCE_THRESHOLD_SECONDS) {
        timestampDivergenceSeconds = diff;
      }
    }
  }

  return {
    event,
    ok,
    computedHash,
    onchainHash,
    blockTime,
    signer,
    txSig: event.solana_tx_sig,
    timestampDivergenceSeconds,
  };
}

// Sanity helper for the landing-page UI: links to a Solana explorer
// without coupling the rest of the codebase to a specific explorer.
export function explorerTxUrl(txSig: string): string {
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet").toLowerCase();
  // Solscan accepts ?cluster=devnet for non-mainnet.
  const base = `https://solscan.io/tx/${txSig}`;
  return cluster === "mainnet" || cluster === "mainnet-beta"
    ? base
    : `${base}?cluster=${cluster}`;
}

export { SHINGI_PROGRAM_ID };
