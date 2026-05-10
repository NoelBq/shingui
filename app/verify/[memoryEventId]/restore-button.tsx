"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useState } from "react";
import { Undo2 } from "lucide-react";

interface RestoreResponse {
  ok: boolean;
  restored?: boolean;
  no_op?: boolean;
  error?: string;
}

export function RestoreButton({ memoryEventId }: { memoryEventId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setError(null);
          setPending(true);
          try {
            const res = await fetch(`/api/restore/${memoryEventId}`, {
              method: "POST",
            });
            const body = (await res
              .json()
              .catch(() => ({}))) as RestoreResponse;
            if (!res.ok || !body.ok) {
              setError(
                `Restore failed: ${body.error ?? `${res.status} ${res.statusText}`}`,
              );
              return;
            }

            // Strip the tamper-diff banner params from the URL so the
            // restored page comes back clean. router.replace + refresh
            // inside startTransition activates the page's <ViewTransition>
            // so the red→green flip animates symmetrically.
            const params = new URLSearchParams(searchParams?.toString() ?? "");
            params.delete("tampered");
            params.delete("before");
            params.delete("after");
            const qs = params.toString();
            startTransition(() => {
              router.replace(qs ? `${pathname}?${qs}` : pathname);
              router.refresh();
            });
          } finally {
            setPending(false);
          }
        }}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-60"
      >
        <Undo2 className="h-3.5 w-3.5" />
        {pending ? "Restoring…" : "Restore this memory"}
      </button>
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </div>
  );
}
