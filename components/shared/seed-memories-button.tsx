"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { Sparkles } from "lucide-react";

interface PreparedItem {
  agentId: string;
  agentSlug: string;
  payload: { content: string; confidence: number; recorded_at: string };
  partialTxBase64: string;
}

interface PrepareResponse {
  ok: boolean;
  prepared?: PreparedItem[];
  error?: string;
}

interface FinalizeResponse {
  ok: boolean;
  memoryEventId?: string;
  txSig?: string;
  error?: string;
}

export function SeedMemoriesButton() {
  const router = useRouter();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        disabled={pending || !connected || !publicKey}
        onClick={() => {
          if (!publicKey) return;
          setError(null);
          setDone(null);
          setProgress("Preparing transactions…");
          startTransition(async () => {
            try {
              const prepRes = await fetch("/api/seed-memories/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feePayer: publicKey.toBase58() }),
              });
              const prepBody = (await prepRes
                .json()
                .catch(() => ({}))) as PrepareResponse;
              if (!prepRes.ok || !prepBody.prepared) {
                setProgress(null);
                setError(prepBody.error ?? `prepare failed: ${prepRes.status}`);
                return;
              }
              const items = prepBody.prepared;

              let confirmed = 0;
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                setProgress(`Signing ${i + 1} / ${items.length}…`);
                const tx = Transaction.from(
                  Buffer.from(item.partialTxBase64, "base64"),
                );
                const txSig = await sendTransaction(tx, connection);
                setProgress(`Confirming ${i + 1} / ${items.length}…`);
                await connection.confirmTransaction(txSig, "confirmed");

                const finRes = await fetch("/api/seed-memories/finalize", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    agentId: item.agentId,
                    payload: item.payload,
                    txSig,
                  }),
                });
                const finBody = (await finRes
                  .json()
                  .catch(() => ({}))) as FinalizeResponse;
                if (!finRes.ok) {
                  setProgress(null);
                  setError(
                    `finalize failed at ${i + 1}/${items.length}: ${
                      finBody.error ?? finRes.status
                    }`,
                  );
                  setDone(confirmed);
                  router.refresh();
                  return;
                }
                confirmed++;
              }
              setProgress(null);
              setDone(confirmed);
              router.refresh();
            } catch (e) {
              setProgress(null);
              setError(e instanceof Error ? e.message : "seed failed");
            }
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-1.5 text-sm font-semibold text-(--accent) transition-colors hover:bg-(--accent)/20 disabled:opacity-60"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {pending
          ? progress ?? "Working…"
          : connected
            ? "Seed memories (admin)"
            : "Connect wallet to seed"}
      </button>

      {error ? (
        <p className="text-xs text-rose-400">Seed failed: {error}</p>
      ) : null}
      {done !== null ? (
        <p className="text-xs text-(--muted)">
          Committed {done} memory event{done === 1 ? "" : "s"} to devnet (paid
          by your connected wallet).
        </p>
      ) : null}
    </div>
  );
}
