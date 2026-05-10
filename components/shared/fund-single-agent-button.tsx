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

const FUND_LAMPORTS = 0.05 * LAMPORTS_PER_SOL;

type FundState =
  | { status: "idle" }
  | { status: "pending"; message: string }
  | { status: "success"; txSig: string }
  | { status: "error"; message: string };

export function FundSingleAgentButton({
  agentPubkey,
  amountSol = 0.05,
}: {
  agentPubkey: string;
  amountSol?: number;
}) {
  const router = useRouter();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [pending, startTransition] = useTransition();
  const [fund, setFund] = useState<FundState>({ status: "idle" });
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={pending || !connected || !publicKey}
        onClick={() => {
          if (!publicKey) return;
          setFund({ status: "pending", message: "Awaiting signature…" });
          startTransition(async () => {
            try {
              const tx = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: new PublicKey(agentPubkey),
                  lamports: amountSol === 0.05
                    ? FUND_LAMPORTS
                    : Math.round(amountSol * LAMPORTS_PER_SOL),
                }),
              );
              tx.feePayer = publicKey;
              const latest = await connection.getLatestBlockhash();
              tx.recentBlockhash = latest.blockhash;

              const sig = await sendTransaction(tx, connection);
              setFund({ status: "pending", message: "Confirming…" });
              await connection.confirmTransaction(
                {
                  signature: sig,
                  blockhash: latest.blockhash,
                  lastValidBlockHeight: latest.lastValidBlockHeight,
                },
                "confirmed",
              );
              setFund({ status: "success", txSig: sig });
              router.refresh();
            } catch (e) {
              setFund({
                status: "error",
                message: e instanceof Error ? e.message : "fund failed",
              });
            }
          });
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-4 py-1.5 text-sm font-semibold text-(--accent) transition-colors hover:bg-(--accent)/20 disabled:opacity-60"
      >
        <Coins className="h-3.5 w-3.5" />
        {pending
          ? fund.status === "pending"
            ? fund.message
            : "Working…"
          : connected
            ? `Fund ${amountSol} SOL`
            : "Connect wallet to fund"}
      </button>
      {fund.status === "success" ? (
        <a
          href={`https://solscan.io/tx/${fund.txSig}?cluster=${cluster}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-(--accent) hover:underline"
        >
          ✓ funded · view tx
        </a>
      ) : null}
      {fund.status === "error" ? (
        <p className="text-xs text-rose-400">{fund.message}</p>
      ) : null}
    </div>
  );
}
