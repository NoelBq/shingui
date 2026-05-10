import { NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/memory/api-key";

// Provisions any missing per-agent assets:
//   - secret_key (Solana keypair)
//   - api_key_hash + api_key_prefix (MCP commit_memory bearer auth)
//
// Both are independently idempotent: an agent that already has secret_key
// but no api_key_hash will get just the API key issued, and vice versa.
//
// The plaintext API keys are returned **once** in the response. They are
// not retrievable later — only their sha256 lives in the database. If a
// key is lost, drop+re-provision (or rotate, when that route lands in v2).
//
// One-shot admin op. Hit once after applying migration 0003 + 0004.
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
      provisionEntry.api_key = issued.key; // returned once
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
