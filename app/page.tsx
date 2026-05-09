import Link from "next/link";
import { ShieldCheck, Hash, FileSearch, ArrowRight } from "lucide-react";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { SeedMemoriesButton } from "@/components/shared/seed-memories-button";
import type { MemoryEvent } from "@/types";

interface RecentMemory {
  id: string;
  agent_name: string;
  agent_slug: string;
  payload: MemoryEvent["payload"];
  solana_tx_sig: string;
  created_at: string;
}

async function loadRecentMemories(limit = 12): Promise<RecentMemory[]> {
  const sb = getServerSupabase() ?? getServiceSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("memory_events")
    .select(
      "id, payload, solana_tx_sig, created_at, agents:agents(name, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => {
    const agent = (row as { agents?: { name?: string; slug?: string } }).agents;
    return {
      id: row.id as string,
      payload: row.payload as MemoryEvent["payload"],
      solana_tx_sig: row.solana_tx_sig as string,
      created_at: row.created_at as string,
      agent_name: agent?.name ?? "—",
      agent_slug: agent?.slug ?? "",
    };
  });
}

export default async function LandingPage() {
  const adminEnabled = process.env.NEXT_PUBLIC_SHINGI_ADMIN_ENABLED === "true";
  const recent = await loadRecentMemories();

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden border-b border-(--border)">
        <div className="pointer-events-none absolute inset-0 shingi-grid opacity-50" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-(--background)" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-(--muted)">
              <span className="kanji-mark text-(--accent)">真偽</span>
              <span>Truth · Falsehood · Onchain</span>
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-(--foreground) sm:text-6xl">
              Tamper-proof memory for{" "}
              <span className="text-(--accent)">autonomous AI agents</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-(--muted)">
              Every thought, observation, and decision an agent records gets
              hash-anchored to Solana. Anyone can verify the log hasn&apos;t been
              edited since it was committed — payload in, hash out, match or
              mismatch.
            </p>
            {adminEnabled ? <SeedMemoriesButton /> : null}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Pillar
              icon={<Hash className="h-4 w-4" />}
              title="Hash-anchored"
              body="Each memory event is hashed and committed in a single Solana transaction. Block timestamp comes from consensus."
            />
            <Pillar
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Operator-resistant"
              body="The verifier always recomputes the hash from the live payload. Edits to the database after the fact are detectable."
            />
            <Pillar
              icon={<FileSearch className="h-4 w-4" />}
              title="Auditable"
              body="Every commit has a Solscan link. Honest about scope: this proves integrity, not truth — the agent could still be wrong."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-(--foreground)">
              Recent memories
            </h2>
            <p className="mt-1 text-sm text-(--muted)">
              Live from Postgres. Click any row to verify it against its
              onchain commit.
            </p>
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface)/40 p-10 text-center text-sm text-(--muted)">
            {adminEnabled
              ? "No memory events yet. Click 'Seed memories (admin)' above to commit six events to devnet."
              : "No memory events yet."}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {recent.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/verify/${m.id}`}
                  className="group flex items-center justify-between gap-6 rounded-2xl border border-(--border) bg-(--surface)/60 p-4 transition-colors hover:border-(--accent)/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-(--muted)">
                      <span>{m.agent_name}</span>
                      <span>·</span>
                      <span>
                        {new Date(m.created_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-(--foreground)">
                      {typeof m.payload.content === "string"
                        ? m.payload.content
                        : JSON.stringify(m.payload).slice(0, 140)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--muted) transition-transform group-hover:translate-x-0.5 group-hover:text-(--accent)" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface)/60 p-5">
      <div className="flex items-center gap-2 text-(--accent)">
        {icon}
        <span className="text-[11px] uppercase tracking-[0.18em]">
          {title}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-(--muted)">{body}</p>
    </div>
  );
}
