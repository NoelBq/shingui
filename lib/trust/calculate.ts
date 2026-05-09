import type {
  Prediction,
  Stake,
  TrustComponents,
  TrustScore,
  Tier,
} from "@/types";
import { tierForScore } from "./tiers";

const WINDOW_DAYS = 30;
const BAYES_ALPHA = 5;
const BAYES_PRIOR = 0.5;
const MIN_PRED_FLOOR = 5;
const MAX_VOLUME = 200;
const MAX_STAKE_LAMPORTS = 10 * 1_000_000_000;
const RECENCY_HALF_LIFE_DAYS = 14;

export interface CalculateInput {
  agentId: string;
  predictions: Prediction[];
  stakes: Stake[];
  now?: Date;
}

export interface CalculateResult {
  score: number;
  tier: Tier;
  components: TrustComponents;
  accuracy_30d: number;
  total_predictions: number;
  correct_predictions: number;
  total_stake_lamports: number;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, (a.getTime() - b.getTime()) / 86_400_000);
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function computeAccuracyComponent(
  resolved: Prediction[],
  now: Date,
): { component: number; window_correct: number; window_total: number } {
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 86_400_000);
  const windowed = resolved.filter(
    (p) => p.resolved_at && new Date(p.resolved_at) >= windowStart,
  );
  const total = windowed.length;
  const correct = windowed.filter((p) => p.outcome === true).length;

  if (total === 0) {
    return { component: 0, window_correct: 0, window_total: 0 };
  }

  if (total < MIN_PRED_FLOOR) {
    const smoothed =
      (correct + BAYES_ALPHA * BAYES_PRIOR) / (total + BAYES_ALPHA);
    return { component: clamp01(smoothed), window_correct: correct, window_total: total };
  }
  return { component: clamp01(correct / total), window_correct: correct, window_total: total };
}

function computeVolumeComponent(totalPredictions: number): number {
  if (totalPredictions <= 0) return 0;
  return clamp01(
    Math.log(totalPredictions + 1) / Math.log(MAX_VOLUME + 1),
  );
}

const RECENCY_SATURATION = 4;

function computeRecencyComponent(resolved: Prediction[], now: Date): number {
  if (resolved.length === 0) return 0;
  const lambda = Math.LN2 / RECENCY_HALF_LIFE_DAYS;
  let weightedCorrect = 0;
  for (const p of resolved) {
    if (!p.resolved_at) continue;
    if (p.outcome !== true) continue;
    const age = daysBetween(now, new Date(p.resolved_at));
    weightedCorrect += Math.exp(-lambda * age);
  }
  return clamp01(weightedCorrect / RECENCY_SATURATION);
}

function computeStakeComponent(stakes: Stake[]): number {
  const total = stakes.reduce((acc, s) => acc + Number(s.amount_lamports), 0);
  if (total <= 0) return 0;
  return clamp01(
    Math.log(total + 1) / Math.log(MAX_STAKE_LAMPORTS + 1),
  );
}

export function calculateTrustScore(input: CalculateInput): CalculateResult {
  const now = input.now ?? new Date();
  const resolved = input.predictions.filter(
    (p) => p.status === "resolved" && p.outcome !== null,
  );

  const { component: accuracy, window_correct, window_total } =
    computeAccuracyComponent(resolved, now);
  const volume = computeVolumeComponent(resolved.length);
  const recency = computeRecencyComponent(resolved, now);
  const stake = computeStakeComponent(input.stakes);

  const components: TrustComponents = { accuracy, volume, recency, stake };

  const raw =
    0.6 * accuracy + 0.15 * volume + 0.15 * recency + 0.1 * stake;
  const score = Math.round(clamp01(raw) * 1000);

  const tier = tierForScore(score).tier;

  const correct = resolved.filter((p) => p.outcome === true).length;
  const totalStake = input.stakes.reduce(
    (acc, s) => acc + Number(s.amount_lamports),
    0,
  );

  return {
    score,
    tier,
    components,
    accuracy_30d: window_total === 0 ? 0 : window_correct / window_total,
    total_predictions: resolved.length,
    correct_predictions: correct,
    total_stake_lamports: totalStake,
  };
}

export function toTrustScoreRecord(
  agentId: string,
  result: CalculateResult,
  computed_at: Date = new Date(),
): TrustScore {
  return {
    agent_id: agentId,
    score: result.score,
    tier: result.tier,
    accuracy_30d: result.accuracy_30d,
    total_predictions: result.total_predictions,
    correct_predictions: result.correct_predictions,
    total_stake_lamports: result.total_stake_lamports,
    components: result.components,
    computed_at: computed_at.toISOString(),
  };
}
