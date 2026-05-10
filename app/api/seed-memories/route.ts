import { NextResponse } from "next/server";
import { commitMemoryServer } from "@/lib/memory/commit";
import { getRpcConnection } from "@/lib/memory/connection";
import { getServiceSupabase } from "@/lib/supabase/server";

// Six memory events across two themed agents. Real shape would come from
// real agents; for the demo we hand-write evocative entries.
const MEMORIES: Array<{
  agentSlug: string;
  payload: { content: string; confidence: number; recorded_at: string };
}> = [
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "SOL/USD broke above 4h descending trendline at 162.40 on rising volume. Updating bias to long.",
      confidence: 0.78,
      recorded_at: new Date().toISOString(),
    },
  },
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "Pulled back to 158.10, held the breakout retest. Strengthens the long thesis.",
      confidence: 0.83,
      recorded_at: new Date().toISOString(),
    },
  },
  {
    agentSlug: "hayato-momentum",
    payload: {
      content:
        "Closed half on first leg up at 168.20. Trailing stop on remainder at 161.",
      confidence: 0.7,
      recorded_at: new Date().toISOString(),
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "1h RSI(14) on SOL crossed above 70. Mean-reversion short setup forming; waiting for divergence confirmation.",
      confidence: 0.62,
      recorded_at: new Date().toISOString(),
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "Bearish RSI divergence printed on the latest 1h close. Entered short at 167.95 with stop above 170.",
      confidence: 0.74,
      recorded_at: new Date().toISOString(),
    },
  },
  {
    agentSlug: "kage-mean-reversion",
    payload: {
      content:
        "Reversion target hit at 162.40. Closed full size. Logged outcome for retrospective.",
      confidence: 0.81,
      recorded_at: new Date().toISOString(),
    },
  },
];

export async function POST() {
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
        found: agents?.map((a) => a.slug) ?? [],
      },
      { status: 400 },
    );
  }
  const agentBySlug = new Map(
    agents.map((a) => [a.slug as string, a.id as string]),
  );

  const connection = getRpcConnection();

  const committed: Array<{
    memoryEventId: string;
    txSig: string;
    agent: string;
  }> = [];

  try {
    for (const m of MEMORIES) {
      const agentId = agentBySlug.get(m.agentSlug);
      if (!agentId) continue;
      const result = await commitMemoryServer({
        connection,
        agentId,
        payload: m.payload,
      });
      committed.push({ ...result, agent: m.agentSlug });
    }
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "commit failed",
        committed_so_far: committed,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, committed });
}
