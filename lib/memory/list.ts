import "server-only";

import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import type { MemoryEvent } from "@/types";

export interface MemoryEventWithAgent {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_slug: string;
  agent_pubkey: string | null;
  payload: MemoryEvent["payload"];
  solana_tx_sig: string;
  created_at: string;
}

export async function listMemories(params: {
  agentSlug?: string;
  limit?: number;
}): Promise<MemoryEventWithAgent[]> {
  const sb = getServerSupabase() ?? getServiceSupabase();
  if (!sb) return [];

  const relation = params.agentSlug ? "agents!inner" : "agents";
  const select = `id, agent_id, payload, solana_tx_sig, created_at, ${relation}(name, slug, owner_wallet)`;

  let query = sb
    .from("memory_events")
    .select(select)
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 50);
  if (params.agentSlug) {
    query = query.eq("agents.slug", params.agentSlug);
  }
  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const r = row as unknown as {
      id: string;
      agent_id: string;
      payload: MemoryEvent["payload"];
      solana_tx_sig: string;
      created_at: string;
      agents?: { name?: string; slug?: string; owner_wallet?: string } | null;
    };
    return {
      id: r.id,
      agent_id: r.agent_id,
      agent_name: r.agents?.name ?? "—",
      agent_slug: r.agents?.slug ?? "",
      agent_pubkey: r.agents?.owner_wallet ?? null,
      payload: r.payload,
      solana_tx_sig: r.solana_tx_sig,
      created_at: r.created_at,
    };
  });
}

export async function getMemory(
  id: string,
): Promise<MemoryEventWithAgent | null> {
  const sb = getServerSupabase() ?? getServiceSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("memory_events")
    .select(
      "id, agent_id, payload, solana_tx_sig, created_at, agents(name, slug, owner_wallet)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const r = data as {
    id: string;
    agent_id: string;
    payload: MemoryEvent["payload"];
    solana_tx_sig: string;
    created_at: string;
    agents?: { name?: string; slug?: string; owner_wallet?: string } | null;
  };
  return {
    id: r.id,
    agent_id: r.agent_id,
    agent_name: r.agents?.name ?? "—",
    agent_slug: r.agents?.slug ?? "",
    agent_pubkey: r.agents?.owner_wallet ?? null,
    payload: r.payload,
    solana_tx_sig: r.solana_tx_sig,
    created_at: r.created_at,
  };
}
