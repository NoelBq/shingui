import "server-only";

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { hashPayloadBytes } from "./hash";
import { encodeCommitMemoryIx } from "./program";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryPayload } from "@/types";

export interface CommitMemoryResult {
  memoryEventId: string;
  txSig: string;
}

// Commits a memory event end-to-end:
//   1. canonical-JSON-hash the payload
//   2. submit a commit_memory tx signed by `signer`
//   3. insert a row in memory_events with the returned tx signature
//
// The hash is intentionally not stored on the row — the verifier always
// recomputes it from `payload`. A stored hash would just be another
// operator-controlled field.
export async function commitMemoryServer(params: {
  connection: Connection;
  signer: Keypair;
  agentId: string;
  agentPubkey: PublicKey;
  payload: MemoryPayload;
}): Promise<CommitMemoryResult> {
  const hash = await hashPayloadBytes(params.payload);

  const ix = encodeCommitMemoryIx({
    signer: params.signer.publicKey,
    agent: params.agentPubkey,
    hash,
  });
  const tx = new Transaction().add(ix);

  const txSig = await sendAndConfirmTransaction(
    params.connection,
    tx,
    [params.signer],
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
