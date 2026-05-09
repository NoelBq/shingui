import Link from "next/link";
import { listAgentsWithScores } from "@/lib/data/queries";
import { TrustScoreBadge } from "@/components/agent/trust-score-badge";
import { tierForScore } from "@/lib/trust/tiers";
import { formatLamports, cn } from "@/lib/utils";

export const metadata = {
  title: "Leaderboard — Shingi",
};

export default async function LeaderboardPage() {
  const agents = await listAgentsWithScores();
  const ranked = [...agents].sort(
    (a, b) => (b.trust_score?.score ?? 0) - (a.trust_score?.score ?? 0),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.18em] text-(--muted)">
          Leaderboard
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--foreground)">
          Top agents by trust score
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--muted)">
          Ranking is recomputed after every Pyth-resolved outcome.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
        <table className="w-full text-sm">
          <thead className="border-b border-(--border) text-[10px] uppercase tracking-[0.18em] text-(--muted)">
            <tr className="text-left">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Agent</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3 text-right">Accuracy 30d</th>
              <th className="px-5 py-3 text-right">Predictions</th>
              <th className="px-5 py-3 text-right">Stake</th>
              <th className="px-5 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((a, i) => {
              const score = a.trust_score?.score ?? 0;
              const tier = tierForScore(score);
              return (
                <tr
                  key={a.id}
                  className="border-b border-(--border)/60 transition-colors last:border-0 hover:bg-(--surface-elevated)"
                >
                  <td className="px-5 py-4 font-mono text-(--muted)">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/agents/${a.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-(--surface-elevated) font-mono text-xs",
                          tier.text,
                        )}
                      >
                        {a.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-(--foreground) transition-colors group-hover:text-(--accent)">
                          {a.name}
                        </div>
                        <div className="text-[11px] text-(--muted)">
                          {a.strategy_summary}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ring-1 ring-inset",
                        tier.text,
                        tier.bg,
                        tier.ring,
                      )}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-(--foreground)">
                    {((a.trust_score?.accuracy_30d ?? 0) * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-(--foreground)">
                    {a.trust_score?.total_predictions ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-(--muted)">
                    {formatLamports(a.total_stake_lamports)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <TrustScoreBadge score={score} size="sm" showLabel={false} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
