import { NextResponse } from "next/server";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getRpcConnection } from "@/lib/memory/connection";
import { getServiceSupabase } from "@/lib/supabase/server";

const LOW_THRESHOLD_LAMPORTS = 0.01 * LAMPORTS_PER_SOL;

export async function GET() {
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  const { data: agents, error } = await sb
    .from("agents")
    .select("slug, name, owner_wallet")
    .not("owner_wallet", "is", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const connection = getRpcConnection();
  const pubkeys = (agents ?? []).map(
    (a) => new PublicKey(a.owner_wallet as string),
  );
  const accounts = await connection.getMultipleAccountsInfo(pubkeys);

  const needsFunding: Array<{
    slug: string;
    name: string;
    pubkey: string;
    lamports: number;
  }> = [];
  const ok: Array<{
    slug: string;
    name: string;
    pubkey: string;
    lamports: number;
  }> = [];

  (agents ?? []).forEach((a, i) => {
    const lamports = accounts[i]?.lamports ?? 0;
    const entry = {
      slug: a.slug as string,
      name: a.name as string,
      pubkey: a.owner_wallet as string,
      lamports,
    };
    if (lamports < LOW_THRESHOLD_LAMPORTS) {
      needsFunding.push(entry);
    } else {
      ok.push(entry);
    }
  });

  return NextResponse.json({
    ok: true,
    threshold_lamports: LOW_THRESHOLD_LAMPORTS,
    needs_funding: needsFunding,
    funded: ok,
  });
}
