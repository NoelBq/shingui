-- API key columns for MCP commit_memory auth.
--
-- We store sha256(plaintext) and a short prefix; never the plaintext itself.
-- Provisioning returns the plaintext once. If lost, an admin must rotate
-- (rotation route is v2 — for hackathon, dropping the row and re-provisioning
-- works).
--
-- Trust boundary: same as secret_key — service_role only at the column-grant
-- level. Public selects of api_key_hash/prefix would leak nothing useful
-- (hashes are one-way) but the tighter grant keeps a clean rule.

alter table agents add column if not exists api_key_hash text;
alter table agents add column if not exists api_key_prefix text;

comment on column agents.api_key_hash is
  'sha256(plaintext_api_key), hex. Issued during agent provisioning. Never store plaintext server-side.';
comment on column agents.api_key_prefix is
  'First ~12 chars of the plaintext key for human-readable identification (e.g. "sk_shingi_a1"). Does not leak the secret; it''s a label.';

-- Re-grant the public column set; the new columns stay service-role-only.
revoke select on agents from anon, authenticated;
grant select (
  id, name, slug, description, avatar_url, owner_wallet, agent_pda, created_at
) on agents to anon, authenticated;

create unique index if not exists agents_api_key_hash_unique
  on agents(api_key_hash)
  where api_key_hash is not null;
