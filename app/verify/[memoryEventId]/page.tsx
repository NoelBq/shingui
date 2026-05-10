import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { explorerTxUrl, verifyMemory } from "@/lib/memory/verify";
import { TamperButton } from "./tamper-button";
import { StatusBanner } from "@/components/verify/status-banner";
import { DiffCard } from "@/components/verify/diff-card";
import { MetaGrid } from "@/components/verify/meta-grid";
import { Clock } from "lucide-react";

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
  const variant = rpcError ? "rpc-error" : ok ? "ok" : "tampered";
  const eventLabel = `#${event.id.replace(/-/g, "").slice(0, 4)}`;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] shingi-grid shingi-grid-mask opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-(--muted)">
          <Link href="/#memories" className="hover:text-(--foreground)">
            ← memories
          </Link>
          <span>/</span>
          <span>verify · {eventLabel}</span>
        </div>

        {tamperDiff && variant === "tampered" ? (
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
          <StatusBanner
            variant={variant}
            blockTime={blockTime}
            rpcError={rpcError}
          />
        </ViewTransition>

        {variant === "tampered" && tamperDiff ? (
          <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DiffCard
              title="Recomputed (live payload)"
              variant="live"
              hash={`0x${computedHash.slice(0, 12)}…${computedHash.slice(-10)}`}
              hashLabel="(mismatch)"
              fields={buildDiffFields(event.payload, tamperDiff, "live")}
            />
            <DiffCard
              title="Onchain commit"
              variant="onchain"
              hash={
                onchainHash
                  ? `0x${onchainHash.slice(0, 12)}…${onchainHash.slice(-10)}`
                  : "—"
              }
              fields={buildDiffFields(event.payload, tamperDiff, "onchain")}
            />
          </div>
        ) : (
          <section className="mt-7 rounded-2xl border border-(--border) bg-(--surface)/60 p-5">
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-(--muted)">
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
        )}

        <div className="mt-6">
          <MetaGrid
            items={[
              {
                label: "Signer",
                value: signer
                  ? `${signer.slice(0, 4)}…${signer.slice(-4)}`
                  : "—",
              },
              {
                label: "Block time",
                value: blockTime
                  ? new Date(blockTime * 1000).toUTCString()
                  : "—",
              },
              {
                label: "Onchain hash",
                value: onchainHash
                  ? `0x${onchainHash.slice(0, 6)}…${onchainHash.slice(-6)}`
                  : "—",
              },
              {
                label: "Tx",
                value: `${txSig.slice(0, 4)}…${txSig.slice(-4)} ↗`,
                href: explorerTxUrl(txSig),
              },
            ]}
          />
        </div>

        {result.timestampDivergenceSeconds !== null ? (
          <div className="mt-6 rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-4 text-xs text-(--warning)">
            <div className="flex items-center gap-2 font-mono font-semibold uppercase tracking-[0.22em]">
              <Clock className="h-3.5 w-3.5" />
              timestamp divergence
            </div>
            <p className="mt-2 leading-relaxed">
              Agent&apos;s self-reported time and onchain block_time differ by{" "}
              {result.timestampDivergenceSeconds}s. Could be commit latency,
              could be backdating.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildDiffFields(
  payload: Record<string, unknown>,
  tamperDiff: { field: string; before: string; after: string },
  variant: "live" | "onchain",
) {
  const fields: { key: string; value: string; flagged?: boolean }[] = [];

  const content =
    typeof payload.content === "string" ? payload.content : null;
  if (content) {
    const truncated =
      content.length > 56 ? `${content.slice(0, 55)}…` : content;
    fields.push({ key: "content", value: `"${truncated}"` });
  }

  const flaggedField = tamperDiff.field;
  const liveValue =
    payload[flaggedField] !== undefined
      ? JSON.stringify(payload[flaggedField])
      : tamperDiff.after;
  const onchainValue = tamperDiff.before;

  fields.push({
    key: flaggedField,
    value: variant === "live" ? liveValue : onchainValue,
    flagged: true,
  });

  return fields;
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
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-(--danger)/40 bg-(--danger)/5 p-4 text-sm">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--danger)/15 text-(--danger)">
        ✎
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 text-(--foreground)">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--danger)">
          just tampered
        </span>
        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
          payload.{field}
        </code>
        <span className="font-mono text-xs text-(--muted)">{before}</span>
        <span className="text-xs text-(--muted)">→</span>
        <span className="font-mono text-xs text-(--danger)">{after}</span>
      </div>
    </div>
  );
}
