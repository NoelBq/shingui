"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRound, Copy, Check, AlertTriangle } from "lucide-react";

interface ProvisionedEntry {
  slug: string;
  pubkey?: string;
  api_key?: string;
  api_key_prefix?: string;
}

interface ProvisionResult {
  ok: boolean;
  provisioned_count?: number;
  skipped_count?: number;
  provisioned?: ProvisionedEntry[];
  note?: string;
  error?: string;
}

export function ProvisionAgentsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const issuedKeys =
    result?.provisioned?.filter((p) => p.api_key) ?? [];

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setResult(null);
          setCopied(null);
          startTransition(async () => {
            const res = await fetch("/api/admin/provision-seeds", {
              method: "POST",
            });
            const body = (await res
              .json()
              .catch(() => ({}))) as ProvisionResult;
            if (!res.ok) {
              setResult({
                ok: false,
                error: body.error ?? `${res.status} ${res.statusText}`,
              });
              return;
            }
            setResult(body);
            router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/60 px-4 py-1.5 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--accent)/40 disabled:opacity-60"
      >
        <KeyRound className="h-3.5 w-3.5" />
        {pending ? "Provisioning…" : "Provision agents"}
      </button>

      {result?.error ? (
        <span className="text-xs text-rose-400">
          Provision failed: {result.error}
        </span>
      ) : null}

      {result?.ok && issuedKeys.length === 0 ? (
        <span className="text-xs text-(--muted)">
          Provisioned {result.provisioned_count ?? 0}; skipped{" "}
          {result.skipped_count ?? 0}.
        </span>
      ) : null}

      {issuedKeys.length > 0 ? (
        <div className="w-full max-w-md rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--warning)">
            <AlertTriangle className="h-3.5 w-3.5" />
            api keys · shown once
          </div>
          <p className="mt-2 text-xs text-(--muted)">
            Copy these now. Only the sha256 hash is stored — there is no way to
            retrieve them later. Use as{" "}
            <code className="font-mono">Authorization: Bearer &lt;key&gt;</code>{" "}
            on MCP <code className="font-mono">commit_memory</code> calls.
          </p>
          <ul className="mt-3 space-y-2">
            {issuedKeys.map((p) => (
              <li
                key={p.slug}
                className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-xs"
              >
                <span className="shrink-0 text-(--muted)">{p.slug}</span>
                <code className="flex-1 truncate font-mono text-(--foreground)">
                  {p.api_key}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    if (!p.api_key) return;
                    await navigator.clipboard.writeText(p.api_key);
                    setCopied(p.slug);
                    setTimeout(
                      () => setCopied((c) => (c === p.slug ? null : c)),
                      1500,
                    );
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--surface)/60 px-2 py-1 text-[11px] font-medium text-(--foreground) transition-colors hover:border-(--accent)/40"
                  aria-label={`Copy API key for ${p.slug}`}
                >
                  {copied === p.slug ? (
                    <>
                      <Check className="h-3 w-3" />
                      copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      copy
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
