import "server-only";

import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { hashPayloadBytes } from "./hash";
import { encodeCommitMemoryIx, decodeCommitMemoryFromTx } from "./program";
import { loadAgentKeypair } from "./agent";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryPayload } from "@/types";

export interface CommitMemoryResult {
  memoryEventId: string;
  txSig: string;
}

export interface PreparedCommit {
  partialTxBase64: string;
  expectedHashHex: string;
  agentPubkey: string;
}

export async function prepareCommitMemoryTx(params: {
  connection: Connection;
  agentId: string;
  payload: MemoryPayload;
  feePayer: PublicKey;
}): Promise<PreparedCommit> {
  const agentKeypair = await loadAgentKeypair(params.agentId);
  const hash = await hashPayloadBytes(params.payload);

  const ix = encodeCommitMemoryIx({
    signer: agentKeypair.publicKey,
    agent: agentKeypair.publicKey,
    hash,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = params.feePayer;
  const latest = await params.connection.getLatestBlockhash();
  tx.recentBlockhash = latest.blockhash;
  tx.partialSign(agentKeypair);

  const serialized = tx.serialize({ requireAllSignatures: false });
  return {
    partialTxBase64: Buffer.from(serialized).toString("base64"),
    expectedHashHex: Buffer.from(hash).toString("hex"),
    agentPubkey: agentKeypair.publicKey.toBase58(),
  };
}

export async function finalizeCommitMemory(params: {
  connection: Connection;
  agentId: string;
  payload: MemoryPayload;
  txSig: string;
}): Promise<CommitMemoryResult> {
  const agentKeypair = await loadAgentKeypair(params.agentId);
  const expectedHash = await hashPayloadBytes(params.payload);

  const result = await decodeCommitMemoryFromTx(
    params.connection,
    params.txSig,
  );
  if (!result.decoded.agent.equals(agentKeypair.publicKey)) {
    throw new Error("onchain agent pubkey does not match expected agent");
  }
  if (
    Buffer.from(result.decoded.hash).compare(Buffer.from(expectedHash)) !== 0
  ) {
    throw new Error("onchain hash does not match expected payload hash");
  }

  const sb = getServiceSupabase();
  if (!sb) {
    throw new Error("Supabase service role not configured");
  }
  const { data, error } = await sb
    .from("memory_events")
    .insert({
      agent_id: params.agentId,
      payload: params.payload,
      original_payload: params.payload,
      solana_tx_sig: params.txSig,
    })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(
      `finalizeCommitMemory: insert failed for tx ${params.txSig}: ${
        error?.message ?? "unknown"
      }`,
    );
  }
  return { memoryEventId: data.id as string, txSig: params.txSig };
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
