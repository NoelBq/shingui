"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Coins } from "lucide-react";

const TARGET_LAMPORTS = 0.05 * LAMPORTS_PER_SOL;
const MAX_AGENTS_PER_TX = 16;

interface AgentNeedingFunds {
  slug: string;
  name: string;
  pubkey: string;
  lamports: number;
}

interface NeedsFundingResponse {
  ok: boolean;
  needs_funding?: AgentNeedingFunds[];
  funded?: AgentNeedingFunds[];
  error?: string;
}

export function FundAgentsButton() {
  const router = useRouter();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    funded: number;
    skipped: number;
    txSig: string;
  } | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending || !connected || !publicKey}
        onClick={() => {
          if (!publicKey) return;
          setError(null);
          setDone(null);
          setProgress("Checking agent balances…");
          startTransition(async () => {
            try {
              const listRes = await fetch("/api/admin/agents-needing-funds");
              const listBody = (await listRes
                .json()
                .catch(() => ({}))) as NeedsFundingResponse;
              if (!listRes.ok || !listBody.needs_funding) {
                setProgress(null);
                setError(listBody.error ?? `${listRes.status}`);
                return;
              }

              const targets = listBody.needs_funding;
              if (targets.length === 0) {
                setProgress(null);
                setDone({
                  funded: 0,
                  skipped: listBody.funded?.length ?? 0,
                  txSig: "",
                });
                return;
              }
              if (targets.length > MAX_AGENTS_PER_TX) {
                setProgress(null);
                setError(
                  `${targets.length} agents need funding; max per tx is ${MAX_AGENTS_PER_TX}. Re-click after this batch.`,
                );
              }

              const batch = targets.slice(0, MAX_AGENTS_PER_TX);
              setProgress(`Building tx for ${batch.length} agent(s)…`);

              const tx = new Transaction();
              for (const a of batch) {
                const topUp = Math.max(0, TARGET_LAMPORTS - a.lamports);
                if (topUp <= 0) continue;
                tx.add(
                  SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(a.pubkey),
                    lamports: topUp,
                  }),
                );
              }
              if (tx.instructions.length === 0) {
                setProgress(null);
                setDone({
                  funded: 0,
                  skipped: listBody.funded?.length ?? 0,
                  txSig: "",
                });
                return;
              }

              tx.feePayer = publicKey;
              const latest = await connection.getLatestBlockhash();
              tx.recentBlockhash = latest.blockhash;

              setProgress("Awaiting wallet signature…");
              const sig = await sendTransaction(tx, connection);
              setProgress("Confirming…");
              await connection.confirmTransaction(
                {
                  signature: sig,
                  blockhash: latest.blockhash,
                  lastValidBlockHeight: latest.lastValidBlockHeight,
                },
                "confirmed",
              );

              setProgress(null);
              setDone({
                funded: batch.length,
                skipped: listBody.funded?.length ?? 0,
                txSig: sig,
              });
              router.refresh();
            } catch (e) {
              setProgress(null);
              setError(e instanceof Error ? e.message : "fund failed");
            }
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-1.5 text-sm font-semibold text-(--accent) transition-colors hover:bg-(--accent)/20 disabled:opacity-60"
      >
        <Coins className="h-3.5 w-3.5" />
        {pending
          ? progress ?? "Working…"
          : connected
            ? "Fund agents"
            : "Connect wallet to fund"}
      </button>

      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
      {done ? (
        done.funded === 0 ? (
          <p className="text-xs text-(--muted)">
            All {done.skipped} agents already funded — no top-up needed.
          </p>
        ) : (
          <p className="text-xs text-(--muted)">
            Funded {done.funded} agent(s) (skipped {done.skipped} already
            funded). Each topped up to 0.05 SOL.
          </p>
        )
      ) : null}
    </div>
  );
}
