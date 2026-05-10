import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ memoryEventId: string }> },
) {
  const { memoryEventId } = await params;
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  const { data, error } = await sb
    .from("memory_events")
    .select("payload, original_payload")
    .eq("id", memoryEventId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (data.original_payload === null || data.original_payload === undefined) {
    return NextResponse.json(
      {
        error:
          "no original_payload — legacy row predating migration 0005. Reset + reseed to fix.",
      },
      { status: 400 },
    );
  }

  const currentJson = JSON.stringify(data.payload);
  const originalJson = JSON.stringify(data.original_payload);
  if (currentJson === originalJson) {
    return NextResponse.json({ ok: true, no_op: true });
  }

  const { error: updateErr } = await sb
    .from("memory_events")
    .update({ payload: data.original_payload })
    .eq("id", memoryEventId);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, restored: true });
}
