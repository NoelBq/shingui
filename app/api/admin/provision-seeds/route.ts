import { NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/memory/api-key";
import { getRpcConnection } from "@/lib/memory/connection";

const AIRDROP_LAMPORTS = 0.5 * LAMPORTS_PER_SOL;

async function airdropOrFlag(pubkey: PublicKey): Promise<boolean> {
  try {
    const connection = getRpcConnection();
    const sig = await connection.requestAirdrop(pubkey, AIRDROP_LAMPORTS);
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      },
      "confirmed",
    );
    return true;
  } catch {
    return false;
  }
}

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
    funding_pending?: boolean;
  }> = [];
  const skipped: string[] = [];

  for (const agent of agents) {
    const updates: Record<string, string> = {};
    const provisionEntry: {
      slug: string;
      pubkey?: string;
      api_key?: string;
      api_key_prefix?: string;
      funding_pending?: boolean;
    } = { slug: agent.slug as string };

    let newKeypair: Keypair | null = null;
    if (!agent.secret_key) {
      newKeypair = Keypair.generate();
      updates.secret_key = JSON.stringify(Array.from(newKeypair.secretKey));
      updates.owner_wallet = newKeypair.publicKey.toBase58();
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

    if (newKeypair) {
      const funded = await airdropOrFlag(newKeypair.publicKey);
      if (!funded) provisionEntry.funding_pending = true;
    }

    provisioned.push(provisionEntry);
  }

  const fundingPending = provisioned
    .filter((p) => p.funding_pending && p.pubkey)
    .map((p) => p.pubkey as string);

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
    funding_pending:
      fundingPending.length > 0
        ? {
            pubkeys: fundingPending,
            instructions:
              "Devnet airdrop failed for these agents. Top up manually with `solana airdrop 0.5 <pubkey>` or `solana transfer <pubkey> 0.5 --keypair <your-funded-wallet>`.",
          }
        : undefined,
  });
}
