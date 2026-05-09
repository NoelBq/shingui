import { describe, it, expect } from "vitest";
import { calculateTrustScore } from "./calculate";
import type { Prediction, Stake } from "@/types";

const NOW = new Date("2026-05-09T00:00:00Z");

function pred(
  daysAgo: number,
  outcome: boolean | null,
  status: "pending" | "resolved" = "resolved",
): Prediction {
  const resolved = new Date(NOW.getTime() - daysAgo * 86_400_000);
  return {
    id: `p-${daysAgo}-${Math.random()}`,
    agent_id: "a1",
    asset: "SOL/USD",
    side: "up",
    entry_price: 100,
    target_price: null,
    deadline: resolved.toISOString(),
    status,
    outcome,
    oracle_price: outcome === null ? null : 105,
    prediction_pda: null,
    prediction_hash: null,
    resolved_at: status === "resolved" ? resolved.toISOString() : null,
    created_at: resolved.toISOString(),
  };
}

function stake(amountSol: number): Stake {
  return {
    id: Math.random().toString(),
    staker_wallet: "wallet",
    agent_id: "a1",
    prediction_id: "p1",
    amount_lamports: Math.floor(amountSol * 1_000_000_000),
    side: "agree",
    tx_signature: "sig",
    claim_status: "open",
    created_at: NOW.toISOString(),
  };
}

describe("calculateTrustScore", () => {
  it("empty agent → score 0, tier Untested", () => {
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: [],
      stakes: [],
      now: NOW,
    });
    expect(r.score).toBe(0);
    expect(r.tier).toBe("Untested");
    expect(r.components.accuracy).toBe(0);
    expect(r.components.recency).toBe(0);
  });

  it("<5 predictions all correct → Bayesian smoothing pulls below 1000", () => {
    const preds = [pred(1, true), pred(2, true), pred(3, true)];
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [],
      now: NOW,
    });
    // 3/3 with α=5, prior=0.5 → (3 + 2.5)/(3 + 5) = 0.6875 accuracy component
    expect(r.components.accuracy).toBeCloseTo(0.6875, 3);
    expect(r.score).toBeLessThan(700);
    expect(r.score).toBeGreaterThan(400);
  });

  it("100 predictions 80% correct, recent → high score", () => {
    const preds: Prediction[] = [];
    for (let i = 0; i < 80; i++) preds.push(pred(((i % 25) + 1), true));
    for (let i = 0; i < 20; i++) preds.push(pred(((i % 25) + 1), false));
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [stake(1)],
      now: NOW,
    });
    expect(r.components.accuracy).toBeGreaterThan(0.7);
    expect(r.components.volume).toBeGreaterThan(0.5);
    expect(r.score).toBeGreaterThan(550);
  });

  it("all-correct but stale (>60 days) → recency drags score down", () => {
    const preds = Array.from({ length: 30 }, (_, i) => pred(60 + i, true));
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [],
      now: NOW,
    });
    // No predictions in 30-day window → accuracy is 0 (no info)
    expect(r.components.accuracy).toBe(0);
    // Recency formula saturates at recent activity, stale activity decays
    expect(r.components.recency).toBeLessThan(0.4);
    expect(r.score).toBeLessThan(300);
  });

  it("high accuracy, no stake → still > 700", () => {
    const preds: Prediction[] = [];
    for (let i = 0; i < 50; i++) preds.push(pred(((i % 20) + 1), true));
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [],
      now: NOW,
    });
    expect(r.components.accuracy).toBe(1);
    expect(r.components.stake).toBe(0);
    expect(r.score).toBeGreaterThan(700);
  });

  it("high stake, low accuracy → still capped", () => {
    const preds: Prediction[] = [];
    for (let i = 0; i < 30; i++) preds.push(pred(i + 1, false));
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [stake(50)],
      now: NOW,
    });
    expect(r.components.accuracy).toBe(0);
    expect(r.score).toBeLessThan(400);
  });

  it("ignores pending predictions", () => {
    const preds = [
      pred(1, true),
      pred(2, true),
      pred(3, true),
      pred(4, true),
      pred(5, true),
      pred(6, true),
      pred(0, null, "pending"),
      pred(0, null, "pending"),
    ];
    const r = calculateTrustScore({
      agentId: "a1",
      predictions: preds,
      stakes: [],
      now: NOW,
    });
    expect(r.total_predictions).toBe(6);
    expect(r.correct_predictions).toBe(6);
  });
});
