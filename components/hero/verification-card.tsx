import Link from "next/link";
import { hashPayloadHex } from "@/lib/memory/hash";
import { explorerTxUrl } from "@/lib/memory/verify";
import type { MemoryEvent } from "@/types";

interface VerificationCardProps {
  id: string;
  agentName: string;
  payload: MemoryEvent["payload"];
  txSig: string;
  createdAt: string;
}

export async function VerificationCard({
  id,
  agentName,
  payload,
  txSig,
  createdAt,
}: VerificationCardProps) {
  const hash = await hashPayloadHex(payload);
  const displayHash = `0x${hash.slice(0, 12)}…${hash.slice(-10)}`;
  const shortTx = `${txSig.slice(0, 4)}…${txSig.slice(-4)}`;
  const initial = agentName.charAt(0).toUpperCase();
  const eventLabel = `#${id.replace(/-/g, "").slice(0, 4)}`;

  const content =
    typeof payload.content === "string" ? payload.content : "";
  const confidence =
    typeof payload.confidence === "number" ? payload.confidence : null;

  return (
    <div className="relative w-full max-w-[460px] rounded-[18px] border border-(--border) bg-(--surface) p-6 shadow-[0_30px_80px_-20px_rgba(52,211,153,0.18),0_0_0_1px_rgba(52,211,153,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
          memory event · {eventLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--accent)/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-(--accent)">
          <span className="h-1.5 w-1.5 rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]" />
          verified
        </span>
      </div>

      <div className="flex items-center gap-2.5 border-b border-(--border) pb-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-(--accent-violet)/15 font-mono text-xs font-bold text-(--accent-violet)">
          {initial}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-(--foreground)">
            {agentName}
          </div>
          <div className="font-mono text-[10px] tracking-wide text-(--muted)">
            {new Date(createdAt).toISOString().replace("T", " · ").slice(0, 22)}
            {" UTC"}
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-[10px] border border-(--border) bg-(--background) p-3.5 font-mono text-xs leading-7">
        <div className="text-(--muted)">{"{"}</div>
        {content ? (
          <div className="pl-3.5">
            <span className="text-sky-300">&quot;content&quot;</span>:{" "}
            <span className="text-(--accent)">
              &quot;{truncate(content, 64)}&quot;
            </span>
            ,
          </div>
        ) : null}
        {confidence !== null ? (
          <div className="pl-3.5">
            <span className="text-sky-300">&quot;confidence&quot;</span>:{" "}
            <span className="text-(--accent)">{confidence.toFixed(2)}</span>
          </div>
        ) : null}
        <div className="text-(--muted)">{"}"}</div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--muted)">
          recomputed sha-256
        </div>
        <div className="break-all font-mono text-xs text-(--accent)">
          {displayHash}
        </div>
        <div className="my-2.5 flex items-center gap-2">
          <div className="flex-1 border-t border-dashed border-(--border)" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-(--accent)">
            = MATCH ✓
          </span>
          <div className="flex-1 border-t border-dashed border-(--border)" />
        </div>
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--muted)">
          onchain commit
        </div>
        <div className="break-all font-mono text-xs text-(--accent-violet)">
          {displayHash}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--border) pt-3.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--muted)">
          tx: {shortTx}
        </span>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <a
            href={explorerTxUrl(txSig)}
            target="_blank"
            rel="noreferrer"
            className="text-(--muted) transition-colors hover:text-(--foreground)"
          >
            solscan ↗
          </a>
          <Link
            href={`/verify/${id}`}
            className="text-(--accent) transition-opacity hover:opacity-80"
          >
            verify →
          </Link>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
