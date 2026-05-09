import type { AgentWithScore } from "@/types";
import { TrustScoreBadge } from "./trust-score-badge";
import { tierForScore } from "@/lib/trust/tiers";
import { formatLamports, shortenAddress, cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function AgentHeader({
  agent,
  rightSlot,
}: {
  agent: AgentWithScore;
  rightSlot?: React.ReactNode;
}) {
  const score = agent.trust_score?.score ?? 0;
  const tier = tierForScore(score);
  const initials = agent.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-8",
        tier.glow,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-2 select-none kanji-mark text-[180px] leading-none text-(--accent)/[0.04]"
      >
        真偽
      </span>
      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl border border-(--border) bg-(--surface-elevated) font-mono text-2xl",
              tier.text,
            )}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-(--foreground)">
                {agent.name}
              </h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ring-1 ring-inset",
                  tier.text,
                  tier.bg,
                  tier.ring,
                )}
              >
                {tier.label}
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-(--muted)">
              {agent.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-(--muted)">
              <span>
                Strategy:{" "}
                <span className="text-(--foreground)">
                  {agent.strategy_summary ?? "—"}
                </span>
              </span>
              <span className="font-mono">
                Owner: {shortenAddress(agent.owner_wallet)}
              </span>
              {agent.agent_pda ? (
                <a
                  href={`https://explorer.solana.com/address/${agent.agent_pda}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-(--accent) hover:underline"
                >
                  PDA: {shortenAddress(agent.agent_pda)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <TrustScoreBadge score={score} size="lg" />
          <div className="text-right text-xs text-(--muted)">
            <div>
              <span className="text-(--foreground)">
                {agent.trust_score?.total_predictions ?? 0}
              </span>{" "}
              predictions
            </div>
            <div>
              <span className="text-(--foreground)">
                {((agent.trust_score?.accuracy_30d ?? 0) * 100).toFixed(0)}%
              </span>{" "}
              accuracy · 30d
            </div>
            <div>
              <span className="text-(--foreground)">
                {formatLamports(agent.total_stake_lamports)}
              </span>{" "}
              staked
            </div>
          </div>
        </div>
      </div>
      {rightSlot ? <div className="relative mt-6">{rightSlot}</div> : null}
    </section>
  );
}
