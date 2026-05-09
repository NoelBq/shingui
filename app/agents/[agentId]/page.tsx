import { notFound } from "next/navigation";
import {
  getAgentBySlug,
  listPredictionsForAgent,
  getAccuracySeries,
} from "@/lib/data/queries";
import { AgentHeader } from "@/components/agent/agent-header";
import { PredictionFeed } from "@/components/agent/prediction-feed";
import { TrustScoreBreakdown } from "@/components/agent/trust-score-breakdown";
import { AccuracyChart } from "@/components/chart/accuracy-chart";
import { StakeDistribution } from "@/components/chart/stake-distribution";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const agent = await getAgentBySlug(agentId);
  if (!agent) notFound();

  const [predictions, series] = await Promise.all([
    listPredictionsForAgent(agent.id, 20),
    getAccuracySeries(agent.id),
  ]);

  // Derive a stake distribution from the feed (placeholder until on-chain wired)
  const agreeStake = Math.floor(agent.total_stake_lamports * 0.62);
  const disagreeStake = agent.total_stake_lamports - agreeStake;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <AgentHeader agent={agent} />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AccuracyChart series={series} />
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-(--foreground)">
                Recent predictions
              </h2>
              <span className="text-[10px] uppercase tracking-[0.18em] text-(--muted)">
                Most recent first
              </span>
            </div>
            <PredictionFeed predictions={predictions} />
          </section>
        </div>
        <aside className="space-y-6">
          {agent.trust_score?.components ? (
            <TrustScoreBreakdown components={agent.trust_score.components} />
          ) : null}
          <StakeDistribution agree={agreeStake} disagree={disagreeStake} />
        </aside>
      </div>
    </div>
  );
}
