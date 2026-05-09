import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  ALL_AGENTS,
  ALL_PREDICTIONS,
  ALL_STAKES,
  listAgents as mockListAgents,
  getAgent as mockGetAgent,
  listAgentPredictions as mockListAgentPredictions,
  getAccuracyTimeSeries as mockGetAccuracyTimeSeries,
  listStakesByWallet as mockListStakesByWallet,
} from "./mock";
import type {
  AgentWithScore,
  Prediction,
  Stake,
  TrustScore,
} from "@/types";
import { calculateTrustScore, toTrustScoreRecord } from "@/lib/trust/calculate";

export async function listAgentsWithScores(): Promise<AgentWithScore[]> {
  const sb = getServerSupabase();
  if (!sb) return mockListAgents();

  const [{ data: agents }, { data: scores }, { data: stakes }] =
    await Promise.all([
      sb.from("agents").select("*"),
      sb.from("trust_scores").select("*"),
      sb.from("stakes").select("agent_id, amount_lamports"),
    ]);

  if (!agents) return mockListAgents();

  const scoreMap = new Map<string, TrustScore>(
    (scores ?? []).map((s) => [s.agent_id, s as TrustScore]),
  );
  const stakeMap = new Map<string, number>();
  for (const s of stakes ?? []) {
    const cur = stakeMap.get(s.agent_id) ?? 0;
    stakeMap.set(s.agent_id, cur + Number(s.amount_lamports));
  }

  return agents.map((a) => ({
    ...(a as AgentWithScore),
    trust_score: scoreMap.get(a.id) ?? null,
    total_stake_lamports: stakeMap.get(a.id) ?? 0,
  }));
}

export async function getAgentBySlug(
  slug: string,
): Promise<AgentWithScore | null> {
  const sb = getServerSupabase();
  if (!sb) return mockGetAgent(slug);

  const { data: agent } = await sb
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!agent) return null;

  const [{ data: score }, { data: stakes }] = await Promise.all([
    sb.from("trust_scores").select("*").eq("agent_id", agent.id).maybeSingle(),
    sb
      .from("stakes")
      .select("amount_lamports")
      .eq("agent_id", agent.id),
  ]);

  const totalStake = (stakes ?? []).reduce(
    (acc, s) => acc + Number(s.amount_lamports),
    0,
  );

  return {
    ...(agent as AgentWithScore),
    trust_score: (score as TrustScore) ?? null,
    total_stake_lamports: totalStake,
  };
}

export async function listPredictionsForAgent(
  agentId: string,
  limit = 20,
): Promise<Prediction[]> {
  const sb = getServerSupabase();
  if (!sb) return mockListAgentPredictions(agentId, limit);

  const { data } = await sb
    .from("predictions")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Prediction[];
}

export async function getAccuracySeries(
  agentId: string,
): Promise<Array<{ date: string; accuracy: number }>> {
  const sb = getServerSupabase();
  if (!sb) return mockGetAccuracyTimeSeries(agentId);

  const { data } = await sb
    .from("predictions")
    .select("resolved_at, outcome, status")
    .eq("agent_id", agentId)
    .eq("status", "resolved")
    .order("resolved_at", { ascending: true });

  if (!data || data.length === 0) return [];
  const window = 5;
  const series: Array<{ date: string; accuracy: number }> = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const correct = slice.filter((p) => p.outcome === true).length;
    series.push({
      date: (data[i].resolved_at as string).slice(0, 10),
      accuracy: correct / slice.length,
    });
  }
  return series;
}

export async function listStakesForWallet(wallet: string): Promise<Stake[]> {
  const sb = getServerSupabase();
  if (!sb) return mockListStakesByWallet(wallet);

  const { data } = await sb
    .from("stakes")
    .select("*")
    .eq("staker_wallet", wallet)
    .order("created_at", { ascending: false });
  return (data ?? []) as Stake[];
}

export function isUsingMockData(): boolean {
  return getServerSupabase() === null;
}
