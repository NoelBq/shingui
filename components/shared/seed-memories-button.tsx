"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";

interface SeedResult {
  ok: boolean;
  committed?: Array<{ memoryEventId: string; txSig: string; agent: string }>;
  error?: string;
}

export function SeedMemoriesButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SeedResult | null>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            const res = await fetch("/api/seed-memories", { method: "POST" });
            const body = (await res.json().catch(() => ({}))) as SeedResult;
            if (!res.ok) {
              setResult({ ok: false, error: body.error ?? `${res.status}` });
              return;
            }
            setResult(body);
            router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-1.5 text-sm font-semibold text-(--accent) transition-colors hover:bg-(--accent)/20 disabled:opacity-60"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {pending ? "Committing 6 memories…" : "Seed memories (admin)"}
      </button>

      {result?.error ? (
        <p className="text-xs text-rose-400">Seed failed: {result.error}</p>
      ) : null}
      {result?.ok && result.committed ? (
        <p className="text-xs text-(--muted)">
          Committed {result.committed.length} memory events to devnet.
        </p>
      ) : null}
    </div>
  );
}
