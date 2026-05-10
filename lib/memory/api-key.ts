import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { getServiceSupabase } from "@/lib/supabase/server";

const KEY_PREFIX = "sk_shingi_";
const KEY_RANDOM_BYTES = 24;

export interface IssuedApiKey {
  key: string;
  hash: string;
  prefix: string;
}

export function generateApiKey(): IssuedApiKey {
  const random = randomBytes(KEY_RANDOM_BYTES).toString("base64url");
  const key = `${KEY_PREFIX}${random}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export interface ResolvedAgent {
  id: string;
  slug: string;
}

export async function findAgentByApiKey(
  plaintextKey: string,
): Promise<ResolvedAgent | null> {
  if (!plaintextKey || !plaintextKey.startsWith(KEY_PREFIX)) {
    return null;
  }
  const sb = getServiceSupabase();
  if (!sb) {
    throw new Error(
      "findAgentByApiKey: service-role Supabase client not configured.",
    );
  }
  const hash = hashApiKey(plaintextKey);
  const { data, error } = await sb
    .from("agents")
    .select("id, slug")
    .eq("api_key_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id as string, slug: data.slug as string };
}
