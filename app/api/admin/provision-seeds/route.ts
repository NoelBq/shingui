import { NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/memory/api-key";

export async function POST() {
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  const { data: agents, error: queryErr } = await sb
    .from("agents")
    .select("id, slug, secret_key, api_key_hash");
  if (queryErr) {
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }
  if (!agents) {
    return NextResponse.json(
      { error: "no agents table data" },
      { status: 404 },
    );
  }

  const provisioned: Array<{
    slug: string;
    pubkey?: string;
    api_key?: string;
    api_key_prefix?: string;
  }> = [];
  const skipped: string[] = [];

  for (const agent of agents) {
    const updates: Record<string, string> = {};
    const provisionEntry: {
      slug: string;
      pubkey?: string;
      api_key?: string;
      api_key_prefix?: string;
    } = { slug: agent.slug as string };

    if (!agent.secret_key) {
      const kp = Keypair.generate();
      updates.secret_key = JSON.stringify(Array.from(kp.secretKey));
      updates.owner_wallet = kp.publicKey.toBase58();
      provisionEntry.pubkey = updates.owner_wallet;
    }

    if (!agent.api_key_hash) {
      const issued = generateApiKey();
      updates.api_key_hash = issued.hash;
      updates.api_key_prefix = issued.prefix;
      provisionEntry.api_key = issued.key;
      provisionEntry.api_key_prefix = issued.prefix;
    }

    if (Object.keys(updates).length === 0) {
      skipped.push(agent.slug as string);
      continue;
    }

    const { error: updateErr } = await sb
      .from("agents")
      .update(updates)
      .eq("id", agent.id);
    if (updateErr) {
      return NextResponse.json(
        {
          error: `update failed for ${agent.slug}: ${updateErr.message}`,
          provisioned_so_far: provisioned,
        },
        { status: 500 },
      );
    }
    provisioned.push(provisionEntry);
  }

  return NextResponse.json({
    ok: true,
    provisioned_count: provisioned.length,
    skipped_count: skipped.length,
    provisioned,
    skipped,
    note:
      provisioned.some((p) => p.api_key)
        ? "api_key values are returned ONCE. Save them now."
        : undefined,
  });
}
