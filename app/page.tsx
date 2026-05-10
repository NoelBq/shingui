import Link from "next/link";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { SeedMemoriesButton } from "@/components/shared/seed-memories-button";
import { ProvisionAgentsButton } from "@/components/shared/provision-agents-button";
import { ResetMemoriesButton } from "@/components/shared/reset-memories-button";
import { CreateAgentForm } from "@/components/shared/create-agent-form";
import { VerificationCard } from "@/components/hero/verification-card";
import { MemoryTable } from "@/components/memory/memory-table";
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

interface LandingPageProps {
  searchParams: Promise<{ agent?: string }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const adminEnabled = process.env.NEXT_PUBLIC_SHINGI_ADMIN_ENABLED === "true";
  const recent = await loadRecentMemories();
  const sp = await searchParams;
  const activeAgent = sp.agent ?? "";

  const uniqueAgents = Array.from(
    new Map(recent.map((m) => [m.agent_slug, m.agent_name])).entries(),
  );
  const filtered = activeAgent
    ? recent.filter((m) => m.agent_slug === activeAgent)
    : recent;

  const showcase = recent[0];

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden border-b border-(--border)">
        <div
          className="pointer-events-none absolute inset-0 shingi-grid shingi-grid-mask opacity-50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-[10%] -top-[20%] h-full w-[55%] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(52,211,153,0.18) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-[5%] -bottom-[30%] h-full w-[50%] blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(167,139,250,0.16) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-(--background)"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-(--border) bg-(--surface)/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-(--muted)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]" />
              truth · falsehood · onchain
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-(--foreground) sm:text-6xl lg:text-[68px]">
              Tamper-proof memory for{" "}
              <span className="text-(--accent)">autonomous AI agents</span>.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.55] text-(--muted)">
              Every thought, observation, and decision an agent records gets
              hash-anchored to Solana. Anyone can verify the log hasn&apos;t
              been edited since it was committed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link
                href="#memories"
                className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
              >
                Browse memories →
              </Link>
              <a
                href="https://github.com/NoelBq/sol-private#readme"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-transparent px-5 py-3 text-sm font-medium text-(--foreground) transition-colors hover:border-(--accent)/40"
              >
                Read the spec
              </a>
            </div>
            {adminEnabled ? (
              <div className="mt-6 flex flex-wrap items-start gap-3">
                <ProvisionAgentsButton />
                <ResetMemoriesButton />
                <SeedMemoriesButton />
                <CreateAgentForm />
              </div>
            ) : null}
            <div className="mt-12 flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-[0.2em] text-(--muted)">
              <span>Built on</span>
              <span className="font-sans text-sm font-medium tracking-[0.04em] text-(--foreground)">
                solana
              </span>
              <span aria-hidden className="h-3.5 w-px bg-(--border)" />
              <span className="font-sans text-sm font-medium tracking-[0.04em] text-(--foreground)">
                anchor
              </span>
              <span aria-hidden className="h-3.5 w-px bg-(--border)" />
              <span className="font-sans text-sm font-medium tracking-[0.04em] text-(--foreground)">
                supabase
              </span>
            </div>
          </div>

          <div className="grid w-full place-items-center lg:place-items-end">
            {showcase ? (
              <VerificationCard
                id={showcase.id}
                agentName={showcase.agent_name}
                payload={showcase.payload}
                txSig={showcase.solana_tx_sig}
                createdAt={showcase.created_at}
              />
            ) : (
              <ShowcasePlaceholder adminEnabled={adminEnabled} />
            )}
          </div>
        </div>
      </section>

      <section id="memories" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-(--accent)">
              live ledger
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.025em] text-(--foreground) sm:text-4xl">
              Recent memories
            </h2>
            <p className="mt-1.5 text-sm text-(--muted)">
              Live from Postgres. Every row is recomputed against its onchain
              commit on click.
            </p>
          </div>
          {uniqueAgents.length > 1 ? (
            <FilterPills agents={uniqueAgents} active={activeAgent} />
          ) : null}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface)/40 p-10 text-center text-sm text-(--muted)">
            {recent.length === 0
              ? adminEnabled
                ? "No memory events yet. Click 'Seed memories (admin)' above to commit six events to devnet."
                : "No memory events yet."
              : "No memories for this agent yet."}
          </div>
        ) : (
          <MemoryTable rows={filtered} />
        )}
      </section>
    </div>
  );
}

function FilterPills({
  agents,
  active,
}: {
  agents: Array<[string, string]>;
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterPill href="/#memories" label="All agents" active={!active} />
      {agents.map(([slug, name]) => (
        <FilterPill
          key={slug}
          href={`/?agent=${encodeURIComponent(slug)}#memories`}
          label={name}
          active={active === slug}
        />
      ))}
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={
        "rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] transition-colors " +
        (active
          ? "border-(--accent)/55 bg-(--accent)/10 text-(--accent)"
          : "border-(--border) text-(--muted) hover:text-(--foreground)")
      }
    >
      {label}
    </Link>
  );
}

function ShowcasePlaceholder({ adminEnabled }: { adminEnabled: boolean }) {
  return (
    <div className="grid w-full max-w-[460px] place-items-center rounded-[18px] border border-dashed border-(--border) bg-(--surface)/40 p-10 text-center text-sm text-(--muted)">
      {adminEnabled
        ? "No memory events yet. Seed some to populate the showcase."
        : "No memory events yet."}
    </div>
  );
}
