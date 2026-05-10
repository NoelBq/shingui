import { GraphMark } from "@/components/brand/graph-mark";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface StatusBannerProps {
  variant: "ok" | "tampered" | "rpc-error";
  blockTime: number | null;
  rpcError?: string | null;
}

export function StatusBanner({
  variant,
  blockTime,
  rpcError,
}: StatusBannerProps) {
  if (variant === "rpc-error") {
    return (
      <div className="rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-6">
        <div className="flex items-center gap-2 text-(--warning)">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]">
            could not fetch onchain tx
          </span>
        </div>
        <p className="mt-2 text-sm text-(--muted)">{rpcError}</p>
      </div>
    );
  }

  if (variant === "ok") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-(--accent)/40 bg-linear-to-b from-(--accent)/[0.10] to-(--accent)/[0.02] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-(--accent)/55 bg-(--accent)/15">
              <CheckCircle2 className="h-5 w-5 text-(--accent)" />
            </div>
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-(--accent)">
                verified · untouched
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-(--foreground)">
                Payload matches the onchain commit.
              </div>
              {blockTime ? (
                <div className="mt-1 font-mono text-[11px] text-(--muted)">
                  committed {new Date(blockTime * 1000).toUTCString()}
                </div>
              ) : null}
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <GraphMark size={140} glow />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--danger)/55 bg-linear-to-b from-(--danger)/[0.10] to-(--danger)/[0.03] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-(--danger)/55 bg-(--danger)/15 text-xl text-(--danger)">
            ✕
          </div>
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-(--danger)">
              tampered · hash mismatch
            </div>
            <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-(--foreground)">
              Payload changed after onchain commit.
            </div>
            {blockTime ? (
              <div className="mt-1 font-mono text-[11px] text-(--muted)">
                committed {new Date(blockTime * 1000).toUTCString()}
              </div>
            ) : null}
          </div>
        </div>
        <div className="hidden shrink-0 sm:block">
          <TamperedNodeMark />
        </div>
      </div>
    </div>
  );
}

function TamperedNodeMark() {
  return (
    <svg
      width="180"
      height="60"
      viewBox="0 0 180 60"
      aria-hidden
      className="block"
    >
      <line
        x1="20"
        y1="14"
        x2="160"
        y2="14"
        stroke="var(--accent)"
        strokeOpacity="0.8"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      {[20, 55, 90, 125, 160].map((x, i) => {
        const tampered = i === 3;
        return (
          <g key={i}>
            <circle cx={x} cy="14" r="5" fill="var(--accent)" />
            <line
              x1={x}
              y1="14"
              x2={x}
              y2={tampered ? 38 : 42}
              stroke={
                tampered ? "var(--danger)" : "var(--accent-violet)"
              }
              strokeOpacity={tampered ? 1 : 0.7}
              strokeWidth="1.2"
              strokeDasharray={tampered ? "2 2" : "3 3"}
            />
            <rect
              x={x - 6}
              y={tampered ? 38 : 42}
              width="12"
              height="12"
              fill={
                tampered ? "var(--danger)" : "var(--accent-violet)"
              }
              transform={tampered ? `rotate(8 ${x} 48)` : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
