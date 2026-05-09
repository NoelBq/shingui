import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { commitMemoryServer } from "@/lib/memory/commit";
import { getRpcConnection, loadAdminKeypair } from "@/lib/memory/connection";
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

  // Resolve agents and bail early if the seed agents aren't in the table.
  const slugs = Array.from(new Set(MEMORIES.map((m) => m.agentSlug)));
  const { data: agents, error: agentsErr } = await sb
    .from("agents")
    .select("id, slug, owner_wallet")
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
  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  let connection: ReturnType<typeof getRpcConnection>;
  let signer: ReturnType<typeof loadAdminKeypair>;
  try {
    connection = getRpcConnection();
    signer = loadAdminKeypair();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "config error" },
      { status: 500 },
    );
  }

  const committed: Array<{ memoryEventId: string; txSig: string; agent: string }> = [];

  for (const m of MEMORIES) {
    const agent = agentBySlug.get(m.agentSlug);
    if (!agent) continue; // already validated above
    let agentPubkey: PublicKey;
    try {
      agentPubkey = new PublicKey(agent.owner_wallet);
    } catch {
      // The seed agents have placeholder owner_wallets; in that case we
      // use the admin signer as the agent identity for the demo. This
      // only matters for what gets recorded as `agent` in the onchain
      // instruction data — the integrity check is unaffected.
      agentPubkey = signer.publicKey;
    }
    const result = await commitMemoryServer({
      connection,
      signer,
      agentId: agent.id as string,
      agentPubkey,
      payload: m.payload,
    });
    committed.push({ ...result, agent: agent.slug as string });
  }

  return NextResponse.json({ ok: true, committed });
}
