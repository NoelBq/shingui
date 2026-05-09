import Link from "next/link";
import { WalletButton } from "@/components/wallet/wallet-button";

const NAV = [
  { href: "/agents", label: "Agents" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-(--background)/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="kanji-mark text-xl font-semibold text-(--accent)">
              真偽
            </span>
            <span className="text-sm font-semibold tracking-wide text-(--foreground)">
              Shingi
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-(--muted) transition-colors hover:text-(--foreground)"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
