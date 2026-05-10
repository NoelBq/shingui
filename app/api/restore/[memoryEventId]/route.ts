import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// Public route. Resets memory_events.payload back to the original_payload
// snapshot taken at commit time. The onchain commit is untouched (it's
// immutable anyway) — restoring just makes the live payload re-hash to the
// committed value, so the next verify returns ok=true.
//
// Idempotent: if payload already equals original_payload, the route returns
// no_op=true without touching the row.
//
// Why this exists: tamper mutates Postgres permanently. Without restore,
// once any visitor tampers a memory, every subsequent visitor sees red.
// With restore, the demo is replayable.
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

  // Idempotency: a deep-equal check via stable stringification.
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
