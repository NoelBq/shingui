import Link from "next/link";
import { WalletButton } from "@/components/wallet/wallet-button";
import { GraphMark } from "@/components/brand/graph-mark";
import { Wordmark } from "@/components/brand/wordmark";
import { DevnetPill } from "@/components/shared/devnet-pill";

const NAV: { href: string; label: string }[] = [];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-(--background)/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center gap-3">
            <GraphMark size={42} />
            <Wordmark size={16} />
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
          <DevnetPill />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
