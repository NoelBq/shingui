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

// A memory event is a single thought / observation / decision an agent
// records. The full payload lives in Postgres for fast retrieval; the
// integrity guarantee comes from `solana_tx_sig` pointing at the onchain
// commit of sha256(canonicalJson(payload)).
//
// The hash is intentionally NOT stored on this row. The verifier always
// recomputes from `payload` at verify time — a stored hash would just be
// another field the operator can edit.
export interface MemoryEvent {
  id: string;
  agent_id: string;
  payload: MemoryPayload;
  solana_tx_sig: string;
  created_at: string;
}

// Loose shape — agents can record arbitrary JSON. The known fields are
// optional conveniences for the verify UI and the demo's tamper button.
export interface MemoryPayload {
  content?: string;
  // Agent's self-reported timestamp. Compared against onchain block_time
  // at verify time to flag backdating.
  recorded_at?: string;
  // Demo-friendly numeric field the tamper button mutates.
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
  // Set when the agent's self-reported `recorded_at` is meaningfully
  // different from the onchain block_time.
  timestampDivergenceSeconds: number | null;
}
