import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST() {
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  const { error, count } = await sb
    .from("memory_events")
    .delete({ count: "exact" })
    .gte("created_at", "1900-01-01");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
