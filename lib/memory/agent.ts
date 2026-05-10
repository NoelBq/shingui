import "server-only";

import { Keypair } from "@solana/web3.js";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function loadAgentKeypair(agentId: string): Promise<Keypair> {
  const sb = getServiceSupabase();
  if (!sb) {
    throw new Error(
      "loadAgentKeypair: service-role Supabase client not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const { data, error } = await sb
    .from("agents")
    .select("secret_key")
    .eq("id", agentId)
    .maybeSingle();
  if (error) {
    throw new Error(`loadAgentKeypair(${agentId}): ${error.message}`);
  }
  if (!data) {
    throw new Error(`loadAgentKeypair: agent ${agentId} not found`);
  }
  if (!data.secret_key) {
    throw new Error(
      `loadAgentKeypair: agent ${agentId} has no keypair. POST /api/admin/provision-seeds first.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(data.secret_key);
  } catch {
    throw new Error(
      `loadAgentKeypair: agent ${agentId} secret_key is not valid JSON`,
    );
  }
  if (!Array.isArray(parsed) || parsed.length !== 64) {
    throw new Error(
      `loadAgentKeypair: agent ${agentId} secret_key must be a 64-byte JSON array, got ${
        Array.isArray(parsed) ? `array of ${parsed.length}` : typeof parsed
      }`,
    );
  }

  return Keypair.fromSecretKey(Uint8Array.from(parsed as number[]));
}
