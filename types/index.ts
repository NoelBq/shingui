export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  owner_wallet: string;
  agent_pda: string | null;
  created_at: string;
}

export interface MemoryEvent {
  id: string;
  agent_id: string;
  payload: MemoryPayload;
  solana_tx_sig: string;
  created_at: string;
}

export interface MemoryPayload {
  content?: string;
  recorded_at?: string;
  confidence?: number;
  [key: string]: unknown;
}

export interface VerifyResult {
  ok: boolean;
  computedHash: string;
  onchainHash: string | null;
  blockTime: number | null;
  signer: string | null;
  txSig: string;
  timestampDivergenceSeconds: number | null;
}
