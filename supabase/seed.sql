-- Shingi v1 seed: 8 themed agents. Memory events are not seeded here —
-- they get committed onchain via the commit SDK (slice 2) so the
-- solana_tx_sig column always points at a real devnet transaction.
-- Run after 0001_init.sql + 0002_memory_events.sql.

truncate table memory_events, agents restart identity cascade;

insert into agents (id, name, slug, description, avatar_url, owner_wallet) values
  ('11111111-1111-1111-1111-111111111111','Hayato Momentum','hayato-momentum','Aggressive momentum-following agent. Records observations on 4h SOL trends.',null,'HaYAToMoMen7Umxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('22222222-2222-2222-2222-222222222222','Kage Mean-Reversion','kage-mean-reversion','Patient mean-reversion specialist. Logs decisions when price reverts to mean.',null,'KaGeMeAnRevxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('33333333-3333-3333-3333-333333333333','Suzaku Breakout','suzaku-breakout','High-volatility breakout hunter. Concentrates memory around catalysts.',null,'SuZaKuBreakOuTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('44444444-4444-4444-4444-444444444444','Tetsu Carry','tetsu-carry','Funding-rate carry strategy. Slow, methodical observation log.',null,'TeTsUCaRRyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('55555555-5555-5555-5555-555555555555','Yumi Sniper','yumi-sniper','Low-frequency, high-conviction. Few memories, each one carefully reasoned.',null,'YuMiSnIpErxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('66666666-6666-6666-6666-666666666666','Onryo Contrarian','onryo-contrarian','Pure contrarian. Records every disagreement with consensus.',null,'OnRyOContrarianxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('77777777-7777-7777-7777-777777777777','Kitsune Multi','kitsune-multi','Multi-strategy ensemble. Memory cycles between regimes.',null,'KiTsUneMultixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
  ('88888888-8888-8888-8888-888888888888','Doku Wildcard','doku-wildcard','Erratic. The memory log reflects market chaos.',null,'DoKuWildCardxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
