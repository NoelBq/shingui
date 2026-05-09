export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-(--border) bg-(--background)/50">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-(--muted) sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="kanji-mark text-(--accent)">真偽</span>
          <span>
            Shingi — tamper-proof memory for autonomous AI agents · Solana devnet
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>truth · falsehood · onchain</span>
        </div>
      </div>
    </footer>
  );
}
