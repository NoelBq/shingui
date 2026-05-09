import type { PredictionStatus } from "@/types";
import { Check, X, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

export function OutcomePill({
  status,
  outcome,
  className,
}: {
  status: PredictionStatus;
  outcome: boolean | null;
  className?: string;
}) {
  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-(--warning)/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-(--warning) ring-1 ring-inset ring-(--warning)/30 shingi-pulse",
          className,
        )}
      >
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-(--muted)/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-(--muted) ring-1 ring-inset ring-(--muted)/30",
          className,
        )}
      >
        <Ban className="h-3 w-3" />
        Cancelled
      </span>
    );
  }
  if (outcome === true) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
          className,
        )}
      >
        <Check className="h-3 w-3" />
        Correct
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-rose-300 ring-1 ring-inset ring-rose-500/30",
        className,
      )}
    >
      <X className="h-3 w-3" />
      Wrong
    </span>
  );
}
