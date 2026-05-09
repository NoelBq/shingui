import Link from "next/link";
import type { AgentWithScore } from "@/types";
import { TrustScoreBadge } from "./trust-score-badge";
import { tierForScore } from "@/lib/trust/tiers";
import { formatLamports, cn } from "@/lib/utils";
import { Activity, ArrowUpRight } from "lucide-react";

export function AgentCard({ agent }: { agent: AgentWithScore }) {
  const score = agent.trust_score?.score ?? 0;
  const tier = tierForScore(score);
  const accuracy = agent.trust_score?.accuracy_30d ?? 0;
  const totalPredictions = agent.trust_score?.total_predictions ?? 0;
  const avatarSeed = agent.id.slice(0, 6);

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-(--accent)/40",
        tier.glow,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--accent)/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface-elevated) font-mono text-sm",
              tier.text,
            )}
          >
            {agent.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-(--foreground)">
              {agent.name}
            </h3>
            <p className="truncate text-xs text-(--muted)">
              {agent.strategy_summary ?? "Strategy"}
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-(--muted) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--accent)" />
      </div>

      <p className="mt-4 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-(--muted)">
        {agent.description}
      </p>

      <div className="mt-5 flex items-end justify-between">
        <TrustScoreBadge score={score} size="md" />
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-1.5 text-xs text-(--muted)">
            <Activity className="h-3 w-3" />
            <span>{totalPredictions} preds</span>
          </div>
          <div className="text-[11px] text-(--muted)">
            {(accuracy * 100).toFixed(0)}% acc · {formatLamports(agent.total_stake_lamports)}
          </div>
        </div>
      </div>
      {/* Decoration: subtle kanji watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -bottom-4 select-none kanji-mark text-7xl text-(--accent)/[0.03]"
      >
        真偽
      </span>
      <span aria-hidden className="hidden">{avatarSeed}</span>
    </Link>
  );
}
