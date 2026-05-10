import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { prepareCommitMemoryTx } from "@/lib/memory/commit";
import { getRpcConnection } from "@/lib/memory/connection";
import { getServiceSupabase } from "@/lib/supabase/server";

const MEMORIES: Array<{
  agentSlug: string;
  payload: { content: string; confidence: number };
}> = [
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "SOL/USD broke above 4h descending trendline at 162.40 on rising volume. Updating bias to long.",
      confidence: 0.78,
    },
  },
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "Pulled back to 158.10, held the breakout retest. Strengthens the long thesis.",
      confidence: 0.83,
    },
  },
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "Closed half on first leg up at 168.20. Trailing stop on remainder at 161.",
      confidence: 0.7,
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "1h RSI(14) on SOL crossed above 70. Mean-reversion short setup forming; waiting for divergence confirmation.",
      confidence: 0.62,
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "Bearish RSI divergence printed on the latest 1h close. Entered short at 167.95 with stop above 170.",
      confidence: 0.74,
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "Reversion target hit at 162.40. Closed full size. Logged outcome for retrospective.",
      confidence: 0.81,
    },
  },
];

export async function POST(req: Request) {
  let body: { feePayer?: string };
  try {
    body = (await req.json()) as { feePayer?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const feePayerStr = body.feePayer?.trim();
  if (!feePayerStr) {
    return NextResponse.json({ error: "feePayer is required" }, { status: 400 });
  }
  let feePayer: PublicKey;
  try {
    feePayer = new PublicKey(feePayerStr);
  } catch {
    return NextResponse.json(
      { error: "feePayer is not a valid base58 pubkey" },
      { status: 400 },
    );
  }

  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  const slugs = Array.from(new Set(MEMORIES.map((m) => m.agentSlug)));
  const { data: agents, error: agentsErr } = await sb
    .from("agents")
    .select("id, slug")
    .in("slug", slugs);
  if (agentsErr) {
    return NextResponse.json({ error: agentsErr.message }, { status: 500 });
  }
  if (!agents || agents.length !== slugs.length) {
    return NextResponse.json(
      {
        error: `expected agents ${slugs.join(", ")}; run supabase/seed.sql first`,
      },
      { status: 400 },
    );
  }
  const agentBySlug = new Map(
    agents.map((a) => [a.slug as string, a.id as string]),
  );

  const connection = getRpcConnection();
  const recordedAt = new Date().toISOString();

  const prepared: Array<{
    agentId: string;
    agentSlug: string;
    payload: { content: string; confidence: number; recorded_at: string };
    partialTxBase64: string;
    expectedHashHex: string;
    agentPubkey: string;
  }> = [];

  for (const m of MEMORIES) {
    const agentId = agentBySlug.get(m.agentSlug);
    if (!agentId) continue;
    const payload = { ...m.payload, recorded_at: recordedAt };
    const out = await prepareCommitMemoryTx({
      connection,
      agentId,
      payload,
      feePayer,
    });
    prepared.push({
      agentId,
      agentSlug: m.agentSlug,
      payload,
      partialTxBase64: out.partialTxBase64,
      expectedHashHex: out.expectedHashHex,
      agentPubkey: out.agentPubkey,
    });
  }

  return NextResponse.json({ ok: true, prepared });
}
