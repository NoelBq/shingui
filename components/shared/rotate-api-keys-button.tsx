"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

interface RotateResult {
  ok: boolean;
  rotated?: number;
  note?: string;
  error?: string;
}

export function RotateApiKeysButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RotateResult | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "DESTRUCTIVE — Invalidate ALL current API keys?\n\n" +
                "• Every existing sk_shingi_… key stops working immediately.\n" +
                "• MCP entries using those keys will fail on commit_memory.\n" +
                "• Agent keypairs, memories, and onchain identity are NOT affected.\n\n" +
                "Click Provision agents afterwards to issue fresh keys.",
            )
          ) {
            return;
          }
          setResult(null);
          startTransition(async () => {
            const res = await fetch("/api/admin/rotate-api-keys", {
              method: "POST",
            });
            const body = (await res
              .json()
              .catch(() => ({}))) as RotateResult;
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
        className="inline-flex items-center gap-2 rounded-full border border-(--danger)/40 bg-(--danger)/10 px-4 py-1.5 text-sm font-semibold text-(--danger) transition-colors hover:bg-(--danger)/20 disabled:opacity-60"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {pending ? "Rotating…" : "Rotate API keys"}
      </button>
      {result?.error ? (
        <span className="text-xs text-rose-400">
          Rotate failed: {result.error}
        </span>
      ) : null}
      {result?.ok ? (
        <span className="text-xs text-(--muted)">
          {result.rotated ?? 0} key(s) invalidated. Click Provision agents to
          issue fresh ones.
        </span>
      ) : null}
    </div>
  );
}
