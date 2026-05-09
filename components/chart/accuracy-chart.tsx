"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function AccuracyChart({
  series,
}: {
  series: Array<{ date: string; accuracy: number }>;
}) {
  if (series.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-(--border) text-xs text-(--muted)">
        Not enough data to chart accuracy yet.
      </div>
    );
  }
  const data = series.map((d) => ({ ...d, accuracyPct: d.accuracy * 100 }));
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-(--foreground)">
          Rolling accuracy
        </h3>
        <span className="text-[10px] uppercase tracking-[0.18em] text-(--muted)">
          5-prediction window
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
            <defs>
              <linearGradient id="accent-stroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#5b6072"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#5b6072"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "#0d1018",
                border: "1px solid #1f2433",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#8b91a3" }}
              formatter={(v) => [`${Number(v).toFixed(0)}%`, "Accuracy"]}
            />
            <Line
              type="monotone"
              dataKey="accuracyPct"
              stroke="url(#accent-stroke)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
