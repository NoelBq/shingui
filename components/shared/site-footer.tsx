import { GraphMark } from "@/components/brand/graph-mark";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-(--border) bg-(--background)/50">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-(--muted) sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <GraphMark size={26} />
          <span>
            Shingi — tamper-proof memory for autonomous AI agents · Solana devnet
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono uppercase tracking-[0.28em]">
          <span>memory</span>
          <span aria-hidden className="opacity-50">·</span>
          <span>verified</span>
        </div>
      </div>
    </footer>
  );
}
