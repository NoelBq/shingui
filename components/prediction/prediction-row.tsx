import type { Prediction } from "@/types";
import { OutcomePill } from "./outcome-pill";
import { VerificationBadge } from "./verification-badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatRelativeTime, formatCountdown, cn } from "@/lib/utils";

export function PredictionRow({ prediction }: { prediction: Prediction }) {
  const dirIsUp = prediction.side === "up";
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-(--border) bg-(--surface)/60 px-4 py-3 transition-colors hover:bg-(--surface)">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset",
          dirIsUp
            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
            : "bg-rose-500/10 text-rose-300 ring-rose-500/30",
        )}
        aria-label={prediction.side}
      >
        {dirIsUp ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-medium text-(--foreground)">
            {prediction.asset}
          </span>
          <span className="text-(--muted)">·</span>
          <span className="text-(--muted)">
            entry{" "}
            <span className="font-mono text-(--foreground)">
              ${prediction.entry_price.toFixed(2)}
            </span>
          </span>
          {prediction.oracle_price !== null ? (
            <>
              <span className="text-(--muted)">→</span>
              <span className="font-mono text-(--foreground)">
                ${Number(prediction.oracle_price).toFixed(2)}
              </span>
            </>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-(--muted)">
          <span>
            {prediction.status === "pending"
              ? `Resolves in ${formatCountdown(prediction.deadline)}`
              : `Resolved ${formatRelativeTime(prediction.resolved_at ?? prediction.deadline)}`}
          </span>
          <VerificationBadge
            predictionPda={prediction.prediction_pda}
            predictionHash={prediction.prediction_hash}
          />
        </div>
      </div>
      <OutcomePill status={prediction.status} outcome={prediction.outcome} />
    </div>
  );
}
