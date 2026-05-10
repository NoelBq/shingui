import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, KeyRound, Hash } from "lucide-react";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { listMemories } from "@/lib/memory/list";

interface AgentRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_wallet: string;
  api_key_prefix: string | null;
  created_at: string;
}

interface AgentPageProps {
  params: Promise<{ slug: string }>;
}

async function loadAgent(slug: string): Promise<AgentRow | null> {
  const sb = getServiceSupabase() ?? getServerSupabase();
  if (!sb) return null;
  const select = getServiceSupabase()
    ? "id, name, slug, description, owner_wallet, api_key_prefix, created_at"
    : "id, name, slug, description, owner_wallet, created_at";
  const { data, error } = await sb
    .from("agents")
    .select(select)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as Partial<AgentRow> & {
    id: string;
    name: string;
    slug: string;
  };
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    owner_wallet: row.owner_wallet ?? "",
    api_key_prefix: row.api_key_prefix ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export default async function AgentProfilePage({ params }: AgentPageProps) {
  const { slug } = await params;
  const agent = await loadAgent(slug);
  if (!agent) notFound();

  const memories = await listMemories({ agentSlug: slug, limit: 50 });

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] shingi-grid shingi-grid-mask opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-(--muted)">
          <Link href="/#memories" className="hover:text-(--foreground)">
            ← memories
          </Link>
          <span>/</span>
          <span>agent · {agent.slug}</span>
        </div>

        <section className="rounded-2xl border border-(--border) bg-(--surface)/60 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-semibold tracking-[-0.025em] text-(--foreground)">
                {agent.name}
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-(--muted)">
                {agent.slug}
              </p>
              {agent.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-(--muted)">
                  {agent.description}
                </p>
              ) : null}
            </div>
            <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[320px]">
              <IdentityCell
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Onchain pubkey"
                value={agent.owner_wallet || "—"}
                mono
              />
              <IdentityCell
                icon={<KeyRound className="h-3.5 w-3.5" />}
                label="API key prefix"
                value={agent.api_key_prefix ?? "—"}
                mono
              />
              <IdentityCell
                label="Memories committed"
                value={String(memories.length)}
              />
              <IdentityCell
                label="Joined"
                value={new Date(agent.created_at).toLocaleDateString()}
              />
            </dl>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-(--foreground)">
              Memories
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
              {memories.length} total
            </span>
          </div>
          {memories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface)/40 p-10 text-center text-sm text-(--muted)">
              No memories committed yet. The agent can record one via MCP
              (commit_memory tool) using its API key.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {memories.map((m) => {
                const content =
                  typeof m.payload.content === "string"
                    ? m.payload.content
                    : JSON.stringify(m.payload).slice(0, 140);
                return (
                  <li key={m.id}>
                    <Link
                      href={`/verify/${m.id}`}
                      className="group flex items-center justify-between gap-6 rounded-2xl border border-(--border) bg-(--surface)/60 p-4 transition-colors hover:border-(--accent)/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
                          <span>
                            {new Date(m.created_at).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          <span aria-hidden>·</span>
                          <span className="truncate">
                            tx {m.solana_tx_sig.slice(0, 6)}…
                            {m.solana_tx_sig.slice(-4)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-(--foreground)">
                          {content}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-(--muted) transition-transform group-hover:translate-x-0.5 group-hover:text-(--accent)" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function IdentityCell({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-black/20 p-3">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
        {icon}
        {label}
      </dt>
      <dd
        className={
          "mt-1.5 break-all text-xs text-(--foreground) " +
          (mono ? "font-mono" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}
