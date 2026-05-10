import Link from "next/link";
import { hashPayloadHex } from "@/lib/memory/hash";
import { ConfBar } from "@/components/memory/conf-bar";
import type { MemoryEvent } from "@/types";

interface MemoryRow {
  id: string;
  agent_name: string;
  agent_slug: string;
  payload: MemoryEvent["payload"];
  solana_tx_sig: string;
  created_at: string;
}

interface MemoryTableProps {
  rows: MemoryRow[];
  activeAgentSlug?: string;
}

export async function MemoryTable({ rows }: MemoryTableProps) {
  const enriched = await Promise.all(
    rows.map(async (m) => ({
      ...m,
      hashHex: await hashPayloadHex(m.payload),
    })),
  );

  return (
    <div className="overflow-hidden rounded-[14px] border border-(--border) bg-(--surface)">
      <div className="grid grid-cols-[140px_70px_1fr_110px_220px_90px] items-center gap-4 border-b border-(--border) px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
        <span>agent</span>
        <span>time</span>
        <span>thought</span>
        <span>conf</span>
        <span>hash</span>
        <span className="text-right">status</span>
      </div>
      {enriched.map((m, i) => {
        const time = new Date(m.created_at).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        const thought =
          typeof m.payload.content === "string"
            ? m.payload.content
            : JSON.stringify(m.payload).slice(0, 140);
        const confidence =
          typeof m.payload.confidence === "number"
            ? m.payload.confidence
            : null;
        const shortHash = `0x${m.hashHex.slice(0, 6)}…${m.hashHex.slice(-6)}`;
        return (
          <Link
            key={m.id}
            href={`/verify/${m.id}`}
            className={
              "grid grid-cols-[140px_70px_1fr_110px_220px_90px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-(--accent)/[0.03] " +
              (i === 0 ? "bg-(--accent)/[0.04] " : "") +
              (i < enriched.length - 1 ? "border-b border-(--border)" : "")
            }
          >
            <span className="truncate text-[13px] font-semibold text-(--foreground)">
              {m.agent_name}
            </span>
            <span className="font-mono text-[11px] text-(--muted) tabular-nums">
              {time}
            </span>
            <span className="truncate text-[13px] text-(--foreground)">
              &quot;{thought}&quot;
            </span>
            <ConfBar value={confidence} />
            <span className="truncate font-mono text-[11px] text-(--accent-violet)">
              {shortHash}
            </span>
            <span className="text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--accent)/10 px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-(--accent)">
                ✓ ok
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
