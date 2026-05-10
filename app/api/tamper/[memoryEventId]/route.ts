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

  const { data: row, error: fetchErr } = await sb
    .from("memory_events")
    .select("payload")
    .eq("id", memoryEventId)
    .maybeSingle();
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const payload = row.payload as Record<string, unknown>;
  const before =
    typeof payload.confidence === "number" ? (payload.confidence as number) : 0.5;
  const after = Number((before + 0.13).toFixed(4));
  const mutated = { ...payload, confidence: after };

  const { error: updateErr } = await sb
    .from("memory_events")
    .update({ payload: mutated })
    .eq("id", memoryEventId);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    mutated_field: "confidence",
    before,
    after,
  });
}
