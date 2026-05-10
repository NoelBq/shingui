"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ProvisionAgentsButton } from "./provision-agents-button";
import { ResetMemoriesButton } from "./reset-memories-button";
import { SeedMemoriesButton } from "./seed-memories-button";
import { CreateAgentForm } from "./create-agent-form";

export function AdminToolbar() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!connected) {
    return (
      <p className="mt-6 text-xs text-(--muted)">
        Connect a wallet to manage agents and seed memories.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-start gap-3">
      <ProvisionAgentsButton />
      <ResetMemoriesButton />
      <SeedMemoriesButton />
      <CreateAgentForm />
    </div>
  );
}
