import "server-only";

import {
  Connection,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { hashPayloadBytes } from "./hash";
import { encodeCommitMemoryIx } from "./program";
import { loadAgentKeypair } from "./agent";
import { loadAdminKeypair } from "./connection";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryPayload } from "@/types";

export interface CommitMemoryResult {
  memoryEventId: string;
  txSig: string;
}

// Commits a memory event end-to-end:
//   1. canonical-JSON-hash the payload
//   2. submit a commit_memory tx
//      - signer (and the `agent` arg in instruction data) = the agent's own keypair
//      - feePayer = the admin keypair (so agents don't need devnet SOL)
//   3. insert a row in memory_events with the returned tx signature
//
// The hash is intentionally not stored on the row — the verifier always
// recomputes it from `payload`. A stored hash would just be another
// operator-controlled field.
//
// Fee-payer model: the admin pays tx fees; the agent signs the data. This
// keeps "who said this" (signer = agent) separate from "who paid for storage"
// (fee_payer = operator), which is closer to how a real production deployment
// would split duties.
export async function commitMemoryServer(params: {
  connection: Connection;
  agentId: string;
  payload: MemoryPayload;
}): Promise<CommitMemoryResult> {
  const agentKeypair = await loadAgentKeypair(params.agentId);
  const feePayer = loadAdminKeypair();

  const hash = await hashPayloadBytes(params.payload);

  const ix = encodeCommitMemoryIx({
    signer: agentKeypair.publicKey,
    agent: agentKeypair.publicKey,
    hash,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = feePayer.publicKey;

  const txSig = await sendAndConfirmTransaction(
    params.connection,
    tx,
    [feePayer, agentKeypair],
    { commitment: "confirmed" },
  );

  const sb = getServiceSupabase();
  if (!sb) {
    throw new Error(
      "Supabase service role not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const { data, error } = await sb
    .from("memory_events")
    .insert({
      agent_id: params.agentId,
      payload: params.payload,
      // Snapshot of the payload at commit time. Powers /api/restore so
      // the public tamper demo is reversible without admin intervention.
      // Hashes from `payload` and `original_payload` are identical at
      // insert time and stay so until something tampers `payload`.
      original_payload: params.payload,
      solana_tx_sig: txSig,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `commitMemoryServer: insert failed for tx ${txSig}: ${
        error?.message ?? "unknown"
      }`,
    );
  }

  return { memoryEventId: data.id as string, txSig };
}
