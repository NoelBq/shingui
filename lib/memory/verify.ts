import "server-only";

import { bytesToHex, hashPayloadBytes } from "./hash";
import {
  decodeCommitMemoryFromTx,
  SHINGI_PROGRAM_ID,
} from "./program";
import { getRpcConnection } from "./connection";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryEvent, VerifyResult } from "@/types";

// Flag self-reported `recorded_at` as suspicious when it diverges from
// onchain block_time by more than this threshold.
const TIMESTAMP_DIVERGENCE_THRESHOLD_SECONDS = 60;

export interface VerifyMemoryRow extends VerifyResult {
  event: MemoryEvent;
}

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
    return {
      event,
      ok: false,
      computedHash,
      onchainHash: null,
      blockTime: null,
      signer: null,
      txSig: event.solana_tx_sig,
      timestampDivergenceSeconds: null,
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

export function explorerTxUrl(txSig: string): string {
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet").toLowerCase();
  const base = `https://solscan.io/tx/${txSig}`;
  return cluster === "mainnet" || cluster === "mainnet-beta"
    ? base
    : `${base}?cluster=${cluster}`;
}

export { SHINGI_PROGRAM_ID };
