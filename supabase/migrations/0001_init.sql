-- Shingi initial schema

create extension if not exists "pgcrypto";

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  avatar_url text,
  strategy_summary text,
  owner_wallet text not null,
  agent_pda text,
  created_at timestamptz not null default now()
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  asset text not null check (asset in ('SOL/USD','BTC/USD','ETH/USD')),
  side text not null check (side in ('up','down')),
  entry_price numeric not null,
  target_price numeric,
  deadline timestamptz not null,
  status text not null default 'pending' check (status in ('pending','resolved','cancelled')),
  outcome boolean,
  oracle_price numeric,
  prediction_pda text,
  prediction_hash text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists stakes (
  id uuid primary key default gen_random_uuid(),
  staker_wallet text not null,
  agent_id uuid not null references agents(id),
  prediction_id uuid not null references predictions(id),
  amount_lamports bigint not null,
  side text not null check (side in ('agree','disagree')),
  tx_signature text not null,
  claim_status text not null default 'open' check (claim_status in ('open','won','lost','claimed')),
  created_at timestamptz not null default now()
);

create table if not exists trust_scores (
  agent_id uuid primary key references agents(id) on delete cascade,
  score int not null,
  tier text not null,
  accuracy_30d numeric,
  total_predictions int,
  correct_predictions int,
  total_stake_lamports bigint,
  components jsonb,
  computed_at timestamptz not null default now()
);

create table if not exists score_history (
  id bigserial primary key,
  agent_id uuid not null references agents(id) on delete cascade,
  score int not null,
  snapshot_at timestamptz not null default now()
);

create index if not exists predictions_agent_created_idx on predictions(agent_id, created_at desc);
create index if not exists predictions_status_deadline_idx on predictions(status, deadline);
create index if not exists stakes_wallet_idx on stakes(staker_wallet);
create index if not exists stakes_agent_idx on stakes(agent_id);
create index if not exists score_history_agent_snap_idx on score_history(agent_id, snapshot_at desc);

alter table agents enable row level security;
alter table predictions enable row level security;
alter table stakes enable row level security;
alter table trust_scores enable row level security;
alter table score_history enable row level security;

create policy "agents_read_all" on agents for select using (true);
create policy "predictions_read_all" on predictions for select using (true);
create policy "stakes_read_all" on stakes for select using (true);
create policy "trust_scores_read_all" on trust_scores for select using (true);
create policy "score_history_read_all" on score_history for select using (true);
