import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { explorerTxUrl, verifyMemory } from "@/lib/memory/verify";
import { TamperButton } from "./tamper-button";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  Pencil,
} from "lucide-react";

interface VerifyPageProps {
  params: Promise<{ memoryEventId: string }>;
  searchParams: Promise<{
    tampered?: string;
    before?: string;
    after?: string;
  }>;
}

export default async function VerifyPage({
  params,
  searchParams,
}: VerifyPageProps) {
  const { memoryEventId } = await params;
  const sp = await searchParams;
  const tamperDiff = sp.tampered
    ? { field: sp.tampered, before: sp.before ?? "", after: sp.after ?? "" }
    : null;

  const result = await verifyMemory(memoryEventId);
  if (!result) notFound();

  const { event, ok, computedHash, onchainHash, blockTime, signer, txSig } =
    result;
  const rpcError = (result as { rpcError?: string }).rpcError ?? null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-(--muted)">
        <span className="kanji-mark text-(--accent)">真偽</span>
        <span>Memory verification</span>
      </div>

      {tamperDiff ? (
        <ViewTransition enter="tamper-diff-enter" default="none">
          <TamperDiffBanner
            field={tamperDiff.field}
            before={tamperDiff.before}
            after={tamperDiff.after}
          />
        </ViewTransition>
      ) : null}

      <ViewTransition
        name="verify-status"
        share={{ default: "verify-status-flip" }}
      >
        <StatusBanner ok={ok} rpcError={rpcError} blockTime={blockTime} />
      </ViewTransition>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-(--border) bg-(--surface)/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-(--muted)">
            Payload (live from Postgres)
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-(--foreground)">
{JSON.stringify(event.payload, null, 2)}
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TamperButton memoryEventId={event.id} />
            <span className="text-xs text-(--muted)">
              Mutates payload.confidence in Postgres. Onchain commit is
              untouched. The next verify will mismatch.
            </span>
          </div>
        </section>

        <aside className="space-y-4">
          <DetailCard label="Computed hash" value={computedHash} mono />
          <DetailCard
            label="Onchain hash"
            value={onchainHash ?? "— (no tx fetched)"}
            mono
          />
          <DetailCard label="Signer" value={signer ?? "—"} mono />
          <DetailCard
            label="Block time"
            value={blockTime ? new Date(blockTime * 1000).toISOString() : "—"}
          />
          {result.timestampDivergenceSeconds !== null ? (
            <div className="rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-4 text-xs text-(--warning)">
              <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.16em]">
                <Clock className="h-3.5 w-3.5" />
                Timestamp divergence
              </div>
              <p className="mt-2 leading-relaxed">
                Agent&apos;s self-reported time and onchain block_time differ by{" "}
                {result.timestampDivergenceSeconds}s. Could be commit latency,
                could be backdating.
              </p>
            </div>
          ) : null}
          <a
            href={explorerTxUrl(txSig)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface)/60 p-4 text-sm text-(--foreground) transition-colors hover:border-(--accent)/40"
          >
            <span>View on Solscan</span>
            <ExternalLink className="h-4 w-4 text-(--muted)" />
          </a>
        </aside>
      </div>

      <div className="mt-10 text-xs text-(--muted)">
        <Link href="/" className="hover:text-(--foreground)">
          ← back
        </Link>
      </div>
    </div>
  );
}

function TamperDiffBanner({
  field,
  before,
  after,
}: {
  field: string;
  before: string;
  after: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/5 p-4 text-sm">
      <Pencil className="h-4 w-4 shrink-0 text-rose-400" />
      <div className="flex flex-1 flex-wrap items-center gap-2 text-(--foreground)">
        <span className="text-xs uppercase tracking-[0.16em] text-rose-300">
          Just tampered
        </span>
        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
          payload.{field}
        </code>
        <span className="font-mono text-xs text-(--muted)">{before}</span>
        <span className="text-xs text-(--muted)">→</span>
        <span className="font-mono text-xs text-rose-300">{after}</span>
      </div>
    </div>
  );
}

function StatusBanner({
  ok,
  rpcError,
  blockTime,
}: {
  ok: boolean;
  rpcError: string | null;
  blockTime: number | null;
}) {
  if (rpcError) {
    return (
      <div className="rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-5">
        <div className="flex items-center gap-2 text-(--warning)">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em]">
            Could not fetch onchain tx
          </span>
        </div>
        <p className="mt-2 text-sm text-(--muted)">{rpcError}</p>
      </div>
    );
  }
  if (ok) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em]">
            Verified · untouched
          </span>
        </div>
        <p className="mt-2 text-sm text-(--muted)">
          The recomputed hash of the live payload matches the onchain commit
          {blockTime
            ? ` from ${new Date(blockTime * 1000).toUTCString()}.`
            : "."}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5">
      <div className="flex items-center gap-2 text-rose-400">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-[0.16em]">
          Tampered · hash mismatch
        </span>
      </div>
      <p className="mt-2 text-sm text-(--muted)">
        The current Postgres payload no longer hashes to the value committed
        onchain
        {blockTime ? ` at ${new Date(blockTime * 1000).toUTCString()}` : ""}.
        Either the payload has been edited since commit, or a different
        payload was committed under this signature.
      </p>
    </div>
  );
}

function DetailCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface)/60 p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-(--muted)">
        {label}
      </div>
      <div
        className={
          "mt-2 break-all text-xs text-(--foreground) " +
          (mono ? "font-mono" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
