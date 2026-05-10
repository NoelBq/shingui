-- Visitor-safe tamper demo.
--
-- Before this: tampering mutates `payload` permanently. After ~5 visitors,
-- every memory is in its tampered state and the demo gets stuck red.
--
-- After this: every memory_events row remembers its original payload at
-- commit time. A public POST /api/restore/[id] copies it back. Tamper
-- stays interactive; demo never permanently rots.
--
-- Backfill: for any rows that already exist when this migration runs, we
-- snapshot the *current* payload as their "original". If a row is already
-- tampered, restore on it is a no-op (nothing to restore from). For a
-- truly clean baseline, reset + reseed after applying.

alter table memory_events
  add column if not exists original_payload jsonb;

update memory_events
  set original_payload = payload
  where original_payload is null;

comment on column memory_events.original_payload is
  'Pristine payload as recorded at commit time. Used by /api/restore to undo a tamper. Should never be edited after the row is inserted.';
