import type {
  Agent,
  AgentWithScore,
  Prediction,
  Stake,
  TrustScore,
} from "@/types";
import { calculateTrustScore, toTrustScoreRecord } from "@/lib/trust/calculate";

const NOW = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const AGENT_DEFS: Array<Omit<Agent, "created_at">> = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Hayato Momentum",
    slug: "hayato-momentum",
    description:
      "Aggressive momentum-following agent with a focus on 4h SOL trends.",
    avatar_url: null,
    strategy_summary: "Momentum / 4h SOL",
    owner_wallet: "HaYAToMoMen7Umxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentHayatoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Kage Mean-Reversion",
    slug: "kage-mean-reversion",
    description:
      "Patient mean-reversion specialist; thrives in chop, suffers in trends.",
    avatar_url: null,
    strategy_summary: "Mean-Reversion / 1h SOL",
    owner_wallet: "KaGeMeAnRevxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentKagexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Suzaku Breakout",
    slug: "suzaku-breakout",
    description:
      "High-volatility breakout hunter; concentrates around catalysts.",
    avatar_url: null,
    strategy_summary: "Breakout / Multi-asset",
    owner_wallet: "SuZaKuBreakOuTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentSuzakuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Tetsu Carry",
    slug: "tetsu-carry",
    description:
      "Funding-rate carry strategy; slow and steady accuracy on directional drift.",
    avatar_url: null,
    strategy_summary: "Carry / Funding",
    owner_wallet: "TeTsUCaRRyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentTetsuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Yumi Sniper",
    slug: "yumi-sniper",
    description:
      "Low-frequency, high-conviction calls. Few predictions, mostly correct.",
    avatar_url: null,
    strategy_summary: "Sniper / Low-frequency",
    owner_wallet: "YuMiSnIpErxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentYumixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Onryo Contrarian",
    slug: "onryo-contrarian",
    description: "Pure contrarian; sells the rip and buys the dip.",
    avatar_url: null,
    strategy_summary: "Contrarian / Multi-asset",
    owner_wallet: "OnRyOContrarianxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentOnryoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "Kitsune Multi",
    slug: "kitsune-multi",
    description: "Multi-strategy ensemble. Cycles between regimes.",
    avatar_url: null,
    strategy_summary: "Ensemble / Multi-asset",
    owner_wallet: "KiTsUneMultixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentKitsunexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    name: "Doku Wildcard",
    slug: "doku-wildcard",
    description: "Erratic, unpredictable. The market chaos agent.",
    avatar_url: null,
    strategy_summary: "Wildcard / SOL",
    owner_wallet: "DoKuWildCardxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    agent_pda: "AgentDokuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
];

interface AgentRecipe {
  count: number;
  correctMod: number;
  correctMatch: "neq" | "eq";
  hourSpacing: number;
  startHoursAgo?: number;
  asset: (i: number) => "SOL/USD" | "BTC/USD" | "ETH/USD";
  side: (i: number) => "up" | "down";
  basePrice: number;
}

const RECIPES: Record<string, AgentRecipe> = {
  // 80% correct, recent, varied assets
  "11111111-1111-1111-1111-111111111111": {
    count: 40,
    correctMod: 5,
    correctMatch: "neq",
    hourSpacing: 1,
    asset: (i) => (i % 3 === 0 ? "SOL/USD" : i % 3 === 1 ? "BTC/USD" : "ETH/USD"),
    side: (i) => (i % 2 === 0 ? "up" : "down"),
    basePrice: 150,
  },
  // ~67% correct, medium
  "22222222-2222-2222-2222-222222222222": {
    count: 25,
    correctMod: 3,
    correctMatch: "neq",
    hourSpacing: 2,
    asset: () => "SOL/USD",
    side: (i) => (i % 2 === 0 ? "up" : "down"),
    basePrice: 130,
  },
  // 75% correct, slower cadence
  "33333333-3333-3333-3333-333333333333": {
    count: 15,
    correctMod: 4,
    correctMatch: "neq",
    hourSpacing: 6,
    asset: (i) => (i % 2 === 0 ? "BTC/USD" : "ETH/USD"),
    side: () => "up",
    basePrice: 3700,
  },
  // ~86% correct, very high volume
  "44444444-4444-4444-4444-444444444444": {
    count: 60,
    correctMod: 7,
    correctMatch: "neq",
    hourSpacing: 4,
    asset: () => "SOL/USD",
    side: () => "up",
    basePrice: 140,
  },
  // 100% correct, only 4 predictions
  "55555555-5555-5555-5555-555555555555": {
    count: 4,
    correctMod: 1,
    correctMatch: "neq",
    hourSpacing: 30 * 24,
    asset: (i) => (i % 3 === 0 ? "SOL/USD" : i % 3 === 1 ? "BTC/USD" : "ETH/USD"),
    side: () => "up",
    basePrice: 140,
  },
  // 20% correct
  "66666666-6666-6666-6666-666666666666": {
    count: 20,
    correctMod: 5,
    correctMatch: "eq",
    hourSpacing: 3,
    asset: () => "SOL/USD",
    side: (i) => (i % 2 === 0 ? "down" : "up"),
    basePrice: 165,
  },
  // ~83% correct, high volume
  "77777777-7777-7777-7777-777777777777": {
    count: 35,
    correctMod: 6,
    correctMatch: "neq",
    hourSpacing: 2,
    asset: (i) => (i % 3 === 0 ? "SOL/USD" : i % 3 === 1 ? "BTC/USD" : "ETH/USD"),
    side: (i) => (i % 2 === 0 ? "up" : "down"),
    basePrice: 250,
  },
  // 50% correct, low volume
  "88888888-8888-8888-8888-888888888888": {
    count: 12,
    correctMod: 2,
    correctMatch: "eq",
    hourSpacing: 5,
    asset: () => "SOL/USD",
    side: () => "down",
    basePrice: 175,
  },
};

function genPredictions(agentId: string): Prediction[] {
  const r = RECIPES[agentId];
  if (!r) return [];
  const out: Prediction[] = [];
  for (let i = 1; i <= r.count; i++) {
    const correct =
      r.correctMatch === "neq" ? i % r.correctMod !== 0 : i % r.correctMod === 0;
    const ts = NOW - (r.startHoursAgo ?? 0) * HOUR - i * r.hourSpacing * HOUR;
    out.push({
      id: `${agentId.slice(0, 8)}-p-${i}`,
      agent_id: agentId,
      asset: r.asset(i),
      side: r.side(i),
      entry_price: r.basePrice,
      target_price: null,
      deadline: new Date(ts).toISOString(),
      status: "resolved",
      outcome: correct,
      oracle_price: r.basePrice * (correct ? 1.05 : 0.95),
      prediction_pda: `PredPda${agentId.slice(0, 6)}${i}`,
      prediction_hash: `0x${i.toString(16).padStart(64, "0")}`,
      resolved_at: new Date(ts).toISOString(),
      created_at: new Date(ts - HOUR).toISOString(),
    });
  }
  return out;
}

function genPendingPredictions(): Prediction[] {
  return [
    {
      id: "pending-hayato-1",
      agent_id: "11111111-1111-1111-1111-111111111111",
      asset: "SOL/USD",
      side: "up",
      entry_price: 150,
      target_price: null,
      deadline: new Date(NOW + 5 * 60_000).toISOString(),
      status: "pending",
      outcome: null,
      oracle_price: null,
      prediction_pda: "PendingPdaHayato1xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      prediction_hash: `0x${"a".repeat(64)}`,
      resolved_at: null,
      created_at: new Date(NOW - 60_000).toISOString(),
    },
    {
      id: "pending-kitsune-1",
      agent_id: "77777777-7777-7777-7777-777777777777",
      asset: "BTC/USD",
      side: "down",
      entry_price: 105_000,
      target_price: null,
      deadline: new Date(NOW + 10 * 60_000).toISOString(),
      status: "pending",
      outcome: null,
      oracle_price: null,
      prediction_pda: "PendingPdaKitsune1xxxxxxxxxxxxxxxxxxxxxxxxxx",
      prediction_hash: `0x${"b".repeat(64)}`,
      resolved_at: null,
      created_at: new Date(NOW - 120_000).toISOString(),
    },
  ];
}

const RESOLVED_PREDICTIONS: Prediction[] = AGENT_DEFS.flatMap((a) =>
  genPredictions(a.id),
);
const PENDING_PREDICTIONS: Prediction[] = genPendingPredictions();
export const ALL_PREDICTIONS: Prediction[] = [
  ...RESOLVED_PREDICTIONS,
  ...PENDING_PREDICTIONS,
];

export const ALL_AGENTS: Agent[] = AGENT_DEFS.map((a) => ({
  ...a,
  created_at: new Date(NOW - 30 * DAY).toISOString(),
}));

export const ALL_STAKES: Stake[] = PENDING_PREDICTIONS.map((p, i) => ({
  id: `stake-${i}`,
  staker_wallet: "DemOStakerWaLLet11111111111111111111111111111",
  agent_id: p.agent_id,
  prediction_id: p.id,
  amount_lamports: 250_000_000 + i * 100_000_000,
  side: i % 2 === 0 ? "agree" : "disagree",
  tx_signature: `mock-sig-${i}`,
  claim_status: "open",
  created_at: new Date(NOW - 60_000).toISOString(),
}));

const SCORES_BY_AGENT = new Map<string, TrustScore>();
for (const a of ALL_AGENTS) {
  const preds = ALL_PREDICTIONS.filter((p) => p.agent_id === a.id);
  const stakes = ALL_STAKES.filter((s) => s.agent_id === a.id);
  const result = calculateTrustScore({
    agentId: a.id,
    predictions: preds,
    stakes,
    now: new Date(NOW),
  });
  SCORES_BY_AGENT.set(a.id, toTrustScoreRecord(a.id, result, new Date(NOW)));
}

export function listAgents(): AgentWithScore[] {
  return ALL_AGENTS.map((a) => {
    const score = SCORES_BY_AGENT.get(a.id) ?? null;
    return {
      ...a,
      trust_score: score,
      total_stake_lamports: ALL_STAKES.filter((s) => s.agent_id === a.id).reduce(
        (acc, s) => acc + s.amount_lamports,
        0,
      ),
    };
  });
}

export function getAgent(slug: string): AgentWithScore | null {
  const a = ALL_AGENTS.find((x) => x.slug === slug || x.id === slug);
  if (!a) return null;
  return {
    ...a,
    trust_score: SCORES_BY_AGENT.get(a.id) ?? null,
    total_stake_lamports: ALL_STAKES.filter((s) => s.agent_id === a.id).reduce(
      (acc, s) => acc + s.amount_lamports,
      0,
    ),
  };
}

export function listAgentPredictions(
  agentId: string,
  limit = 20,
): Prediction[] {
  return ALL_PREDICTIONS.filter((p) => p.agent_id === agentId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

export function getAccuracyTimeSeries(
  agentId: string,
): Array<{ date: string; accuracy: number }> {
  const preds = ALL_PREDICTIONS.filter(
    (p) => p.agent_id === agentId && p.status === "resolved",
  ).sort(
    (a, b) =>
      new Date(a.resolved_at!).getTime() - new Date(b.resolved_at!).getTime(),
  );
  if (preds.length === 0) return [];
  // Rolling 5-prediction accuracy window
  const window = 5;
  const series: Array<{ date: string; accuracy: number }> = [];
  for (let i = 0; i < preds.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = preds.slice(start, i + 1);
    const correct = slice.filter((p) => p.outcome === true).length;
    series.push({
      date: preds[i].resolved_at!.slice(0, 10),
      accuracy: correct / slice.length,
    });
  }
  return series;
}

export function listStakesByWallet(wallet: string): Stake[] {
  return ALL_STAKES.filter((s) => s.staker_wallet === wallet);
}

export function getPendingDemoPrediction(): Prediction | null {
  return PENDING_PREDICTIONS[0] ?? null;
}
