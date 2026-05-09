-- Shingi demo seed: 8 themed agents with engineered accuracy curves
-- Run after 0001_init.sql

truncate table score_history, trust_scores, stakes, predictions, agents restart identity cascade;

insert into agents (id, name, slug, description, avatar_url, strategy_summary, owner_wallet) values
  ('11111111-1111-1111-1111-111111111111','Hayato Momentum','hayato-momentum','Aggressive momentum-following agent with a focus on 4h SOL trends.',null,'Momentum / 4h SOL','HaYAToMoMen7Umxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('22222222-2222-2222-2222-222222222222','Kage Mean-Reversion','kage-mean-reversion','Patient mean-reversion specialist; thrives in chop, suffers in trends.',null,'Mean-Reversion / 1h SOL','KaGeMeAnRevxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('33333333-3333-3333-3333-333333333333','Suzaku Breakout','suzaku-breakout','High-volatility breakout hunter; concentrates around catalysts.',null,'Breakout / Multi-asset','SuZaKuBreakOuTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('44444444-4444-4444-4444-444444444444','Tetsu Carry','tetsu-carry','Funding-rate carry strategy; slow and steady accuracy on directional drift.',null,'Carry / Funding','TeTsUCaRRyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('55555555-5555-5555-5555-555555555555','Yumi Sniper','yumi-sniper','Low-frequency, high-conviction calls. Few predictions, mostly correct.',null,'Sniper / Low-frequency','YuMiSnIpErxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('66666666-6666-6666-6666-666666666666','Onryo Contrarian','onryo-contrarian','Pure contrarian; sells the rip and buys the dip.',null,'Contrarian / Multi-asset','OnRyOContrarianxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('77777777-7777-7777-7777-777777777777','Kitsune Multi','kitsune-multi','Multi-strategy ensemble. Cycles between regimes.',null,'Ensemble / Multi-asset','KiTsUneMultixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('88888888-8888-8888-8888-888888888888','Doku Wildcard','doku-wildcard','Erratic, unpredictable. The market chaos agent.',null,'Wildcard / SOL','DoKuWildCardxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

-- Predictions: vary accuracy and recency by agent
-- Helper: insert N predictions for an agent; pattern is a string of 'C' (correct) or 'W' (wrong) per slot.
-- We unroll inline since plpgsql isn't strictly necessary in seeds.

-- Hayato Momentum: high accuracy, high volume, recent (Trusted/Elite range)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '11111111-1111-1111-1111-111111111111',
  case (i % 3) when 0 then 'SOL/USD' when 1 then 'BTC/USD' else 'ETH/USD' end,
  case when random() < 0.5 then 'up' else 'down' end,
  100 + (random() * 50),
  null,
  now() - (i || ' hours')::interval,
  'resolved',
  (i % 5) <> 0, -- 80% correct
  100 + (random() * 50),
  now() - (i || ' hours')::interval,
  now() - ((i + 1) || ' hours')::interval
from generate_series(1, 40) as g(i);

-- Kage Mean-Reversion: medium accuracy, medium volume (Reliable)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '22222222-2222-2222-2222-222222222222',
  'SOL/USD',
  case when i % 2 = 0 then 'up' else 'down' end,
  120 + (random() * 30),
  null,
  now() - ((i * 2) || ' hours')::interval,
  'resolved',
  (i % 3) <> 0, -- ~67% correct
  120 + (random() * 30),
  now() - ((i * 2) || ' hours')::interval,
  now() - ((i * 2 + 1) || ' hours')::interval
from generate_series(1, 25) as g(i);

-- Suzaku Breakout: high accuracy when active, but bursty
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '33333333-3333-3333-3333-333333333333',
  case (i % 2) when 0 then 'BTC/USD' else 'ETH/USD' end,
  'up',
  3500 + (random() * 200),
  null,
  now() - ((i * 6) || ' hours')::interval,
  'resolved',
  (i % 4) <> 0, -- 75% correct
  3500 + (random() * 200),
  now() - ((i * 6) || ' hours')::interval,
  now() - ((i * 6 + 2) || ' hours')::interval
from generate_series(1, 15) as g(i);

-- Tetsu Carry: very high accuracy, very high volume, slow
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '44444444-4444-4444-4444-444444444444',
  'SOL/USD',
  'up',
  130 + (random() * 20),
  null,
  now() - ((i * 4) || ' hours')::interval,
  'resolved',
  (i % 7) <> 0, -- ~86% correct
  130 + (random() * 20),
  now() - ((i * 4) || ' hours')::interval,
  now() - ((i * 4 + 1) || ' hours')::interval
from generate_series(1, 60) as g(i);

-- Yumi Sniper: 4 predictions, all correct (will be Bayesian-smoothed)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
values
  ('55555555-5555-5555-5555-555555555555','SOL/USD','up',140,null, now() - interval '20 hours', 'resolved', true, 148, now() - interval '20 hours', now() - interval '22 hours'),
  ('55555555-5555-5555-5555-555555555555','BTC/USD','down',104000,null, now() - interval '5 days', 'resolved', true, 101200, now() - interval '5 days', now() - interval '6 days'),
  ('55555555-5555-5555-5555-555555555555','ETH/USD','up',3700,null, now() - interval '12 days', 'resolved', true, 3920, now() - interval '12 days', now() - interval '13 days'),
  ('55555555-5555-5555-5555-555555555555','SOL/USD','up',135,null, now() - interval '25 days', 'resolved', true, 142, now() - interval '25 days', now() - interval '26 days');

-- Onryo Contrarian: low accuracy, medium volume (Emerging)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '66666666-6666-6666-6666-666666666666',
  'SOL/USD',
  case when i % 2 = 0 then 'down' else 'up' end,
  150 + (random() * 30),
  null,
  now() - ((i * 3) || ' hours')::interval,
  'resolved',
  (i % 5) = 0, -- 20% correct
  150 + (random() * 30),
  now() - ((i * 3) || ' hours')::interval,
  now() - ((i * 3 + 1) || ' hours')::interval
from generate_series(1, 20) as g(i);

-- Kitsune Multi: high overall, ensemble (Trusted)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '77777777-7777-7777-7777-777777777777',
  case (i % 3) when 0 then 'SOL/USD' when 1 then 'BTC/USD' else 'ETH/USD' end,
  case when i % 2 = 0 then 'up' else 'down' end,
  200 + (random() * 100),
  null,
  now() - ((i * 2) || ' hours')::interval,
  'resolved',
  (i % 6) <> 0, -- ~83% correct
  200 + (random() * 100),
  now() - ((i * 2) || ' hours')::interval,
  now() - ((i * 2 + 1) || ' hours')::interval
from generate_series(1, 35) as g(i);

-- Doku Wildcard: erratic, ~50% (Untested → Emerging)
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at)
select
  '88888888-8888-8888-8888-888888888888',
  'SOL/USD',
  'down',
  160 + (random() * 40),
  null,
  now() - ((i * 5) || ' hours')::interval,
  'resolved',
  (i % 2) = 0,
  160 + (random() * 40),
  now() - ((i * 5) || ' hours')::interval,
  now() - ((i * 5 + 1) || ' hours')::interval
from generate_series(1, 12) as g(i);

-- 2 pending predictions for live demo: one each, deadlines ~5 min and 10 min from now
insert into predictions (agent_id, asset, side, entry_price, target_price, deadline, status, outcome, oracle_price, resolved_at, created_at) values
  ('11111111-1111-1111-1111-111111111111','SOL/USD','up',150, null, now() + interval '5 minutes', 'pending', null, null, null, now()),
  ('77777777-7777-7777-7777-777777777777','BTC/USD','down',105000, null, now() + interval '10 minutes', 'pending', null, null, null, now());

-- Sample stakes to show pool distribution
insert into stakes (staker_wallet, agent_id, prediction_id, amount_lamports, side, tx_signature)
select
  'DemOStakerWaLLet11111111111111111111111111111',
  p.agent_id,
  p.id,
  (100_000_000 + floor(random() * 400_000_000))::bigint,
  case when random() < 0.7 then 'agree' else 'disagree' end,
  'demoSig' || md5(p.id::text)
from predictions p
where p.status = 'pending';
