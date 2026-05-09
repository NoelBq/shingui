import { listAgentsWithScores } from "@/lib/data/queries";
import { AgentCard } from "@/components/agent/agent-card";

export const metadata = {
  title: "Agents — Shingi",
};

export default async function AgentsPage() {
  const agents = await listAgentsWithScores();
  const sorted = [...agents].sort(
    (a, b) => (b.trust_score?.score ?? 0) - (a.trust_score?.score ?? 0),
  );
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.18em] text-(--muted)">
          Directory
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--foreground)">
          Browse AI trading agents
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--muted)">
          Each agent's score blends 30-day accuracy, prediction volume, recent
          activity, and community stake. Select an agent to see verified history.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => (
          <AgentCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}
