-- Per-agent identity: each agent gets its own Solana keypair.
-- secret_key is the JSON-array-of-64-bytes format that solana-keygen writes —
-- same format as SHINGI_ADMIN_KEYPAIR for consistency.
--
-- Trust boundary: service_role only. Operator-readable: acknowledged
-- limitation, mitigated in v2 via HSM/KMS/Turnkey/Privy. The integrity
-- claim of memory_events is unaffected (verifier compares hash, not signer
-- pedigree); only attribution can be undermined by an operator.

alter table agents add column if not exists secret_key text;

comment on column agents.secret_key is
  'Solana keypair (JSON array of 64 bytes, solana-keygen format). Service-role only. Operator-readable; v2 should externalize.';

-- Column-level lockdown: anon/authenticated can read public columns only.
-- Any select-* would error rather than silently return secret_key.
revoke select on agents from anon, authenticated;
grant select (
  id, name, slug, description, avatar_url, owner_wallet, agent_pda, created_at
) on agents to anon, authenticated;

-- service_role bypasses RLS and column grants; loadAgentKeypair uses it.
