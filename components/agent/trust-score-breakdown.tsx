import type { TrustComponents } from "@/types";

const ROWS: Array<{ key: keyof TrustComponents; label: string; weight: number }> = [
  { key: "accuracy", label: "Accuracy (30d)", weight: 0.6 },
  { key: "volume", label: "Volume", weight: 0.15 },
  { key: "recency", label: "Recency", weight: 0.15 },
  { key: "stake", label: "Community stake", weight: 0.1 },
];

export function TrustScoreBreakdown({
  components,
}: {
  components: TrustComponents;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-(--foreground)">
          Score breakdown
        </h3>
        <span className="text-[10px] uppercase tracking-[0.18em] text-(--muted)">
          Weighted components
        </span>
      </div>
      <ul className="space-y-3">
        {ROWS.map((row) => {
          const value = components[row.key];
          const contribution = value * row.weight * 1000;
          return (
            <li key={row.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-(--foreground)">{row.label}</span>
                <span className="font-mono text-(--muted)">
                  <span className="text-(--foreground)">
                    +{Math.round(contribution)}
                  </span>{" "}
                  · {(value * 100).toFixed(0)}% × {(row.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-(--border)">
                <div
                  className="h-full rounded-full bg-(--accent)/80"
                  style={{ width: `${Math.min(100, value * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
