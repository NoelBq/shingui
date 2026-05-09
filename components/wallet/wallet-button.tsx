"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-9 w-32 rounded-full border border-(--border) bg-(--surface)"
        disabled
      />
    );
  }

  if (connected && publicKey) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="group inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-1.5 text-sm font-medium text-(--foreground) transition-colors hover:border-(--accent)/40 hover:text-(--accent)"
        aria-label="Disconnect wallet"
      >
        <Wallet className="h-3.5 w-3.5" />
        <span className="font-mono text-xs">
          {shortenAddress(publicKey.toBase58())}
        </span>
        <LogOut className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      disabled={connecting}
      className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-4 py-1.5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      <Wallet className="h-3.5 w-3.5" />
      {connecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
