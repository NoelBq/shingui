import { NextResponse } from "next/server";
import { Keypair } from "@solana/web3.js";
import { getServiceSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/memory/api-key";

interface CreateAgentBody {
  name?: string;
  slug?: string;
  description?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Creates a brand-new agent in one shot:
//   - validate name + slug (auto-derive slug from name if absent)
//   - generate Solana keypair (sets owner_wallet to its pubkey)
//   - generate MCP API key (stores hash + prefix; returns plaintext once)
//   - insert agents row
//
// Returns the plaintext API key in the response. Save it immediately —
// only the sha256 lives in the database.
//
// No server-side admin auth in this slice (matches the existing /api/admin/*
// routes; hackathon scope on devnet). The route is gated by
// NEXT_PUBLIC_SHINGI_ADMIN_ENABLED in the UI only.
export async function POST(req: Request) {
  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "service-role supabase not configured" },
      { status: 500 },
    );
  }

  let body: CreateAgentBody;
  try {
    body = (await req.json()) as CreateAgentBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "name is required (2..80 chars)" },
      { status: 400 },
    );
  }

  const slug = body.slug?.trim() ? slugify(body.slug.trim()) : slugify(name);
  if (!slug || slug.length < 2) {
    return NextResponse.json(
      {
        error:
          "could not derive a valid slug from the inputs. Use letters/digits.",
      },
      { status: 400 },
    );
  }

  const description = body.description?.trim() || null;
  if (description && description.length > 280) {
    return NextResponse.json(
      { error: "description must be <= 280 chars" },
      { status: 400 },
    );
  }

  // Slug uniqueness — DB has a unique constraint, but a friendlier error.
  const { data: existing, error: lookupErr } = await sb
    .from("agents")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json(
      { error: `slug "${slug}" is already in use` },
      { status: 409 },
    );
  }

  const kp = Keypair.generate();
  const apiKey = generateApiKey();

  const { data, error: insertErr } = await sb
    .from("agents")
    .insert({
      name,
      slug,
      description,
      owner_wallet: kp.publicKey.toBase58(),
      secret_key: JSON.stringify(Array.from(kp.secretKey)),
      api_key_hash: apiKey.hash,
      api_key_prefix: apiKey.prefix,
    })
    .select("id, name, slug")
    .single();
  if (insertErr || !data) {
    return NextResponse.json(
      { error: insertErr?.message ?? "insert failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    agent: {
      id: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
      pubkey: kp.publicKey.toBase58(),
      api_key: apiKey.key, // plaintext, returned ONCE
      api_key_prefix: apiKey.prefix,
    },
    note:
      "api_key is shown ONCE. Save it now — only its sha256 is stored server-side.",
  });
}
