-- Shingi v1 pivot: replace trading-domain tables with memory_events.
-- Trust boundary: operator vs. user. The verifier always recomputes the hash
-- from `payload` at verify time and compares to the onchain commit referenced
-- by `solana_tx_sig`. The hash is intentionally NOT stored in this table.

drop table if exists score_history cascade;
drop table if exists trust_scores cascade;
drop table if exists stakes cascade;
drop table if exists predictions cascade;

-- Drop trading-specific columns from agents. Keep id/name/slug/description/
-- avatar/owner_wallet/agent_pda/created_at.
alter table agents drop column if exists strategy_summary;

create table if not exists memory_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  payload jsonb not null,
  solana_tx_sig text not null,
  created_at timestamptz not null default now()
);

create index if not exists memory_events_agent_created_idx
  on memory_events(agent_id, created_at desc);
create index if not exists memory_events_tx_sig_idx
  on memory_events(solana_tx_sig);

alter table memory_events enable row level security;

create policy "memory_events_read_all"
  on memory_events for select using (true);
