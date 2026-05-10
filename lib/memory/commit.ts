import "server-only";

import {
  Connection,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { hashPayloadBytes } from "./hash";
import { encodeCommitMemoryIx } from "./program";
import { loadAgentKeypair } from "./agent";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryPayload } from "@/types";

export interface CommitMemoryResult {
  memoryEventId: string;
  txSig: string;
}

export async function commitMemoryServer(params: {
  connection: Connection;
  agentId: string;
  payload: MemoryPayload;
}): Promise<CommitMemoryResult> {
  const agentKeypair = await loadAgentKeypair(params.agentId);

  const hash = await hashPayloadBytes(params.payload);

  const ix = encodeCommitMemoryIx({
    signer: agentKeypair.publicKey,
    agent: agentKeypair.publicKey,
    hash,
  });

  const tx = new Transaction().add(ix);

  const txSig = await sendAndConfirmTransaction(
    params.connection,
    tx,
    [agentKeypair],
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
