"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

interface ResetResult {
  ok: boolean;
  deleted?: number;
  error?: string;
}

export function ResetMemoriesButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResetResult | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Wipe all memory_events rows? Onchain commits stay; this only clears the Postgres pointer table.",
            )
          ) {
            return;
          }
          setResult(null);
          startTransition(async () => {
            const res = await fetch("/api/admin/reset-memories", {
              method: "POST",
            });
            const body = (await res.json().catch(() => ({}))) as ResetResult;
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
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? "Resetting…" : "Reset memories"}
      </button>
      {result?.error ? (
        <span className="text-xs text-rose-400">
          Reset failed: {result.error}
        </span>
      ) : null}
      {result?.ok ? (
        <span className="text-xs text-(--muted)">
          Deleted {result.deleted ?? 0} rows.
        </span>
      ) : null}
    </div>
  );
}
