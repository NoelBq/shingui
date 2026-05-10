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
    .from("agents")
    .update(
      { api_key_hash: null, api_key_prefix: null },
      { count: "exact" },
    )
    .not("api_key_hash", "is", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    rotated: count ?? 0,
    note: "Old keys invalidated. Click 'Provision agents' to issue new ones.",
  });
}
