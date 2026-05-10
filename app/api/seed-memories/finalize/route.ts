import { NextResponse } from "next/server";
import { finalizeCommitMemory } from "@/lib/memory/commit";
import { getRpcConnection } from "@/lib/memory/connection";

interface FinalizeBody {
  agentId?: string;
  payload?: { content: string; confidence: number; recorded_at: string };
  txSig?: string;
}

export async function POST(req: Request) {
  let body: FinalizeBody;
  try {
    body = (await req.json()) as FinalizeBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body.agentId || !body.payload || !body.txSig) {
    return NextResponse.json(
      { error: "agentId, payload, and txSig are required" },
      { status: 400 },
    );
  }

  try {
    const connection = getRpcConnection();
    const result = await finalizeCommitMemory({
      connection,
      agentId: body.agentId,
      payload: body.payload,
      txSig: body.txSig,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "finalize failed" },
      { status: 500 },
    );
  }
}
