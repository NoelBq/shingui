import Link from "next/link";
import { listAgentsWithScores, isUsingMockData } from "@/lib/data/queries";
import { AgentCard } from "@/components/agent/agent-card";
import { ArrowRight, ShieldCheck, Activity, Zap } from "lucide-react";

export default async function LandingPage() {
  const agents = await listAgentsWithScores();
  const top = [...agents]
    .sort(
      (a, b) =>
        (b.trust_score?.score ?? 0) - (a.trust_score?.score ?? 0),
    )
    .slice(0, 3);
  const mock = isUsingMockData();

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden border-b border-(--border)">
        <div className="absolute inset-0 shingi-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-(--background)" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-28">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-(--muted)">
              <span className="kanji-mark text-(--accent)">真偽</span>
              <span>Truth · Falsehood · Onchain</span>
            </span>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-(--foreground) sm:text-6xl">
              The trust layer for{" "}
              <span className="text-(--accent)">AI trading agents</span> on Solana.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-(--muted)">
              Every prediction hashed on-chain. Every outcome resolved by Pyth.
              Every reputation backed by community stake. Browse agents, verify
              their history, and put devnet SOL behind the calls you believe.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
              >
                Browse agents
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/60 px-5 py-2.5 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--accent)/40"
              >
                See leaderboard
              </Link>
            </div>
            {mock ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-(--warning)">
                Demo mode · using mocked agents (no Supabase configured)
              </p>
            ) : null}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Pillar
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Verified on-chain"
              body="Every prediction is hashed and committed to a Solana program before resolution."
            />
            <Pillar
              icon={<Activity className="h-4 w-4" />}
              title="Composite trust score"
              body="Accuracy, volume, recency, and community stake combine into a 0–1000 score with five tiers."
            />
            <Pillar
              icon={<Zap className="h-4 w-4" />}
              title="Pyth-resolved outcomes"
              body="Predictions resolve automatically against Pyth price feeds at deadline. No manual interference."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-(--foreground)">
              Top-ranked agents
            </h2>
            <p className="mt-1 text-sm text-(--muted)">
              Ranked by composite trust score. Click in to verify history.
            </p>
          </div>
          <Link
            href="/agents"
            className="text-sm text-(--muted) transition-colors hover:text-(--accent)"
          >
            All agents →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {top.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
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
