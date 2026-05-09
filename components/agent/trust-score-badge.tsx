import { tierForScore } from "@/lib/trust/tiers";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZES: Record<
  Size,
  { ring: string; text: string; label: string; outer: string }
> = {
  sm: {
    ring: "h-10 w-10 ring-2",
    text: "text-xs",
    label: "text-[9px]",
    outer: "gap-2",
  },
  md: {
    ring: "h-14 w-14 ring-2",
    text: "text-base",
    label: "text-[10px]",
    outer: "gap-3",
  },
  lg: {
    ring: "h-20 w-20 ring-[3px]",
    text: "text-2xl",
    label: "text-[11px]",
    outer: "gap-4",
  },
};

export function TrustScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: {
  score: number;
  size?: Size;
  showLabel?: boolean;
}) {
  const tier = tierForScore(score);
  const s = SIZES[size];
  return (
    <div className={cn("inline-flex items-center", s.outer)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-(--surface-elevated) ring-(color:--accent)/20 font-mono font-semibold",
          tier.ring,
          tier.text,
          tier.glow,
          s.ring,
          s.text,
        )}
      >
        {score}
      </div>
      {showLabel ? (
        <div className="flex flex-col">
          <span
            className={cn(
              "uppercase tracking-[0.18em]",
              tier.text,
              s.label,
            )}
          >
            {tier.label}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-(--muted)">
            Trust score
          </span>
        </div>
      ) : null}
    </div>
  );
}
