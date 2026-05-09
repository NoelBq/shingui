import { Lock, ExternalLink } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export function VerificationBadge({
  predictionPda,
  predictionHash,
}: {
  predictionPda: string | null;
  predictionHash: string | null;
}) {
  if (!predictionPda) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-(--muted)">
        <Lock className="h-3 w-3 opacity-50" />
        Unsigned
      </span>
    );
  }
  return (
    <a
      href={`https://explorer.solana.com/address/${predictionPda}?cluster=devnet`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-(--accent) hover:underline"
      title={predictionHash ? `Hash: ${predictionHash}` : "On-chain prediction"}
    >
      <Lock className="h-3 w-3" />
      <span>{shortenAddress(predictionPda, 4)}</span>
      <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
