import { formatLamports } from "@/lib/utils";

export function StakeDistribution({
  agree,
  disagree,
}: {
  agree: number;
  disagree: number;
}) {
  const total = agree + disagree;
  const agreePct = total === 0 ? 50 : (agree / total) * 100;
  const disagreePct = 100 - agreePct;
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-(--foreground)">
          Community stake
        </h3>
        <span className="font-mono text-xs text-(--muted)">
          {formatLamports(total)} total
        </span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-(--border)">
        <div
          className="h-full bg-emerald-500/80"
          style={{ width: `${agreePct}%` }}
        />
        <div
          className="h-full bg-rose-500/70"
          style={{ width: `${disagreePct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <div className="flex flex-col">
          <span className="text-emerald-300">Agree · {agreePct.toFixed(0)}%</span>
          <span className="font-mono text-[11px] text-(--muted)">
            {formatLamports(agree)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-rose-300">
            Disagree · {disagreePct.toFixed(0)}%
          </span>
          <span className="font-mono text-[11px] text-(--muted)">
            {formatLamports(disagree)}
          </span>
        </div>
      </div>
    </div>
  );
}
