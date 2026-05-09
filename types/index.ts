export type AssetSymbol = "SOL/USD" | "BTC/USD" | "ETH/USD";
export type Direction = "up" | "down";
export type StakeSide = "agree" | "disagree";
export type PredictionStatus = "pending" | "resolved" | "cancelled";
export type ClaimStatus = "open" | "won" | "lost" | "claimed";

export type Tier =
  | "Untested"
  | "Emerging"
  | "Reliable"
  | "Trusted"
  | "Elite";

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  strategy_summary: string | null;
  owner_wallet: string;
  agent_pda: string | null;
  created_at: string;
}

export interface Prediction {
  id: string;
  agent_id: string;
  asset: AssetSymbol;
  side: Direction;
  entry_price: number;
  target_price: number | null;
  deadline: string;
  status: PredictionStatus;
  outcome: boolean | null;
  oracle_price: number | null;
  prediction_pda: string | null;
  prediction_hash: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Stake {
  id: string;
  staker_wallet: string;
  agent_id: string;
  prediction_id: string;
  amount_lamports: number;
  side: StakeSide;
  tx_signature: string;
  claim_status: ClaimStatus;
  created_at: string;
}

export interface TrustComponents {
  accuracy: number;
  volume: number;
  recency: number;
  stake: number;
}

export interface TrustScore {
  agent_id: string;
  score: number;
  tier: Tier;
  accuracy_30d: number;
  total_predictions: number;
  correct_predictions: number;
  total_stake_lamports: number;
  components: TrustComponents;
  computed_at: string;
}

export interface ScoreHistoryPoint {
  agent_id: string;
  score: number;
  snapshot_at: string;
}

export interface AgentWithScore extends Agent {
  trust_score: TrustScore | null;
  total_stake_lamports: number;
}
