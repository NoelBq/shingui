"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { startTransition, useState } from "react";
import { ZapOff } from "lucide-react";

interface TamperResponse {
  ok: boolean;
  mutated_field?: string;
  before?: number;
  after?: number;
  error?: string;
}

export function TamperButton({ memoryEventId }: { memoryEventId: string }) {
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
            const res = await fetch(`/api/tamper/${memoryEventId}`, {
              method: "POST",
            });
            const body = (await res.json().catch(() => ({}))) as TamperResponse;
            if (!res.ok || !body.ok) {
              setError(
                `Tamper failed: ${body.error ?? `${res.status} ${res.statusText}`}`,
              );
              return;
            }

            const params = new URLSearchParams(searchParams?.toString() ?? "");
            if (body.mutated_field) params.set("tampered", body.mutated_field);
            if (body.before !== undefined) params.set("before", String(body.before));
            if (body.after !== undefined) params.set("after", String(body.after));

            startTransition(() => {
              router.replace(`${pathname}?${params.toString()}`);
              router.refresh();
            });
          } finally {
            setPending(false);
          }
        }}
        className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-1.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
      >
        <ZapOff className="h-3.5 w-3.5" />
        {pending ? "Tampering…" : "Tamper this memory"}
      </button>
      {error ? (
        <span className="text-xs text-rose-400">{error}</span>
      ) : null}
    </div>
  );
}
