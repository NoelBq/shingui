interface ConfBarProps {
  value: number | null;
}

export function ConfBar({ value }: ConfBarProps) {
  if (value === null) {
    return (
      <span className="font-mono text-[11px] text-(--muted)">—</span>
    );
  }
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-(--border)">
        <div
          className="h-full bg-(--accent)"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-(--muted) tabular-nums">
        {pct.toFixed(2)}
      </span>
    </div>
  );
}
