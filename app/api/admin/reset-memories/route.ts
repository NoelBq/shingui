import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// Wipes all memory_events rows. Demo helper — useful between recordings or
// when switching from admin-signed to per-agent-signed memories.
//
// Onchain commits are unaffected: those txs still exist on devnet and are
// queryable by tx_sig. We're only clearing the Postgres pointer table.
export async function POST() {
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  // Supabase requires a filter on delete; gte on created_at matches every row.
  const { error, count } = await sb
    .from("memory_events")
    .delete({ count: "exact" })
    .gte("created_at", "1900-01-01");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
