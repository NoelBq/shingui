<p align="center">
  <img src="public/brand/readme-banner.svg" alt="Shingi banner" width="960" />
</p>

<h1 align="center">Shingi</h1>

<p align="center">
  <strong>Tamper-evident memory for autonomous AI agents on Solana.</strong><br />
  Hash-anchor offchain memory logs and verify whether they were rewritten after commit.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react" />
  <img alt="Solana Devnet" src="https://img.shields.io/badge/Solana-devnet-111111?style=flat-square&logo=solana" />
  <img alt="Supabase Postgres" src="https://img.shields.io/badge/Supabase-Postgres-111111?style=flat-square&logo=supabase" />
  <img alt="Anchor" src="https://img.shields.io/badge/Anchor-0.31.1-111111?style=flat-square" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-runtime-111111?style=flat-square&logo=bun" />
</p>

> Shingi provides cryptographic integrity for agent memory logs.
>
> It does **not** provide truth verification, hallucination detection, or "AI forensics." The trust boundary is operator vs. user, not AI vs. user.

# Shingi (真偽)

Tamper-proof memory layer for autonomous AI agents on Solana. Every thought, observation, or decision an agent records gets hash-anchored to a single Solana transaction. Anyone can verify the log hasn't been edited since it was committed.

**What it provides:** cryptographic integrity for agent memory logs.
**What it does NOT provide:** truth, hallucination detection, or "AI forensics." The trust boundary is operator vs. user — not AI vs. user.

## Stack

- Next.js 16 / React 19 / Tailwind v4 (App Router, bun)
- Supabase (Postgres) for live payload storage
- Solana devnet, single-instruction Anchor program ([programs/shingi/](programs/shingi/))
- LiteSVM for in-process program tests

## Architecture (Pattern A)

| Layer                    | What lives there                              | Mutability                    |
| ------------------------ | --------------------------------------------- | ----------------------------- |
| Postgres `memory_events` | `payload jsonb`, `solana_tx_sig`              | Operator-controlled (mutable) |
| Solana                   | One `commit_memory(agent, hash)` tx per event | Consensus-stamped (immutable) |

The hash is **not** stored in Postgres. The verifier always recomputes `sha256(canonicalJson(payload))` from the live row and compares to the onchain commit. A stored hash would just be another field the operator can edit.

## What a non-admin visitor can do

Most of the demo is public — no API key, no admin flag needed:

| Action                             | URL                          | Notes                                           |
| ---------------------------------- | ---------------------------- | ----------------------------------------------- |
| Browse the landing page + memories | `/`                          |                                                 |
| Verify any memory                  | `/verify/[id]`               | Real onchain proof, ✅/❌ banner                |
| Tamper a memory                    | "Tamper this memory" button  | Flips the page green→red live                   |
| **Restore a memory**               | "Restore this memory" button | Brings it back to ✓ — keeps the demo replayable |
| View an agent's profile            | `/agents/[slug]`             | Public                                          |
| Use MCP read tools                 | Claude Code, no API key      | `verify_memory`, `list_memories`, `get_memory`  |

Admin actions (provision, reset, seed, create new agent, MCP `commit_memory`) are gated. The visitor experience is "watch tamper-proof memory in action," not "build the system from scratch."

## Demo flow

When admin is enabled (`NEXT_PUBLIC_SHINGI_ADMIN_ENABLED=true`), the landing page exposes three admin buttons:

1. **Provision agents** (one-time, after applying migration 0003) — generates a Solana keypair for each seeded agent and writes it to `agents.secret_key`. Idempotent.
2. **Reset memories** — wipes the `memory_events` table. Onchain commits stay; only the Postgres pointer table is cleared. Useful between demo recordings.
3. **Seed memories** — commits 6 memory events to devnet, each signed by its own agent's keypair (admin pays fees as `feePayer`).

Then the verify loop:

4. Click any memory in the **Recent memories** list → `/verify/[id]`.
5. Status banner shows ✅ **Verified · untouched** with the onchain block_time. The signer field shows the agent's pubkey (not the admin's).
6. Click **Tamper this memory** — backend mutates `payload.confidence` in Postgres.
7. Page refreshes → ❌ **Tampered · hash mismatch**, with a Solscan link to the original commit.

## Getting started

```sh
bun install

# Solana toolchain (one-time)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Anchor (one-time, cargo only)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.31.1 && avm use 0.31.1

# Wallet for deploy (one-time)
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url devnet
solana airdrop 2   # or use https://faucet.solana.com if rate-limited

# Build & deploy the program
cargo build-sbf --manifest-path programs/shingi/Cargo.toml
cargo test --manifest-path programs/shingi/Cargo.toml   # LiteSVM smoke test
solana program deploy target/deploy/shingi.so \
  --program-id programs/shingi/shingi-keypair.json

# Run the migrations + seed agents
# (in your Supabase dashboard or via supabase CLI)
psql ... -f supabase/migrations/0001_init.sql
psql ... -f supabase/migrations/0002_memory_events.sql
psql ... -f supabase/seed.sql

# Start the app
bun run dev
```

Open <http://localhost:3000>.

## Environment variables

Copy `.env.example` to `.env.local` and fill in.

| Variable                           | Required | Purpose                                                                                                                                                                                                                                               |
| ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`         | yes      | Supabase project URL                                                                                                                                                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | yes      | Supabase anon key (read-only RLS)                                                                                                                                                                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`        | yes      | Service role key for server inserts (seed + tamper routes)                                                                                                                                                                                            |
| `SHINGI_ADMIN_KEYPAIR`             | yes      | JSON array of 64 bytes — the keypair that signs `commit_memory` txs from the admin seed route. Generate with `solana-keygen new -o /tmp/admin.json --no-bip39-passphrase --silent` and paste the file contents. **Fund it on devnet** before seeding. |
| `NEXT_PUBLIC_SHINGI_ADMIN_ENABLED` | no       | Set to `"true"` to show the "Seed memories" button on the landing page                                                                                                                                                                                |
| `NEXT_PUBLIC_SOLANA_RPC_URL`       | no       | Override RPC endpoint (default: `https://api.devnet.solana.com`). Used by both server and wallet adapter.                                                                                                                                             |
| `SOLANA_RPC_URL`                   | no       | Server-only RPC override (takes precedence over `NEXT_PUBLIC_SOLANA_RPC_URL`). Useful if you have a paid endpoint server-side.                                                                                                                        |
| `NEXT_PUBLIC_SOLANA_CLUSTER`       | no       | Used to build Solscan links. Default: `devnet`. Set to `mainnet` for production.                                                                                                                                                                      |

## Known limitations (acknowledged)

- **Memory-hole attack:** the operator can simply delete a `memory_events` row. Pattern A doesn't fix this; v2 addresses it via mirroring or Merkle batches.
- **Truth:** the system proves the payload hasn't been edited, not that the agent's claim was correct. The agent could have hallucinated and committed a hallucination.
- **Operator can impersonate agents.** Each agent's secret key lives in `agents.secret_key` (service-role-only at the column-grant level). Anyone with the service-role key can read it and sign as that agent. The integrity of `memory_events` is preserved (verifier compares hash, not signer pedigree); only attribution is undermined. Production would externalize keys to HSM / Turnkey / Privy / KMS so secrets never touch the operator's database.

## MCP server

Shingi exposes its tools as an MCP server at `POST /api/mcp`. Any MCP-compatible client (Claude Code, Claude Desktop, Cursor, etc.) can use it.

**Tools exposed:**

| Tool            | Auth                 | Purpose                                                                                      |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `verify_memory` | none                 | Recompute the live payload's hash, fetch the onchain commit, return ok/tampered with details |
| `list_memories` | none                 | Browse recent memory events, optionally filtered by agent slug                               |
| `get_memory`    | none                 | Fetch one memory's payload + tx signature without verifying                                  |
| `commit_memory` | `Bearer sk_shingi_…` | Record a new memory event onchain under the calling agent's identity                         |

### API keys

Each agent has its own API key, issued during provisioning. Send it as `Authorization: Bearer sk_shingi_<key>` to call `commit_memory`. Read tools work without auth — the data is public-read anyway.

The plaintext key is shown **once** in the response from `POST /api/admin/provision-seeds` (and rendered in the admin "Provision agents" button UI). Only the sha256 hash is stored. If a key is lost, drop the row and re-provision.

### Agents

Each agent has a public profile at `/agents/[slug]` with its onchain pubkey, API-key prefix, and full memory history. Anyone can browse — no auth.

To create a brand-new agent on the fly, click **Create new agent** in the admin toolbar (admin must be enabled). Enter a name; the slug auto-derives. The new agent gets a Solana keypair + API key, both revealed once. Wire the API key into a fresh `claude mcp add` entry to drive that agent from Claude Code:

```sh
claude mcp add shingi-newagent --transport http http://localhost:3000/api/mcp \
  --header "Authorization: Bearer sk_shingi_<new-key>"
```

The agent will sign commit_memory txs with its own keypair (admin keypair pays fees as `feePayer`). Verify any of its memories and you'll see its own pubkey in the `signer` field.

### Connect from Claude Code

```sh
# Read-only — no auth needed
claude mcp add shingi --transport http http://localhost:3000/api/mcp

# Read + commit, scoped to one agent's identity
claude mcp add shingi-hayato --transport http http://localhost:3000/api/mcp \
  --header "Authorization: Bearer sk_shingi_<hayato-key>"
```

Then in Claude Code, ask things like:

- _"verify memory `<id>`"_
- _"list Hayato's recent memories"_
- _"commit a memory: I just observed SOL bouncing off 158 support"_ — the agent identity is whoever's API key is wired into the MCP entry. Verify the result with `verify_memory(returned_id)` and you'll get ok=true with the agent's pubkey as signer.

## Tests

```sh
bun run test    # vitest: hash core + program client encode/decode + MCP schemas
cargo test --manifest-path programs/shingi/Cargo.toml   # LiteSVM
```

## Out of scope (v2)

- SIWS / wallet-based login session
- Pattern C Merkle batching + indexer
- Real AI agents calling `commitMemory` directly
- Multi-agent dispute UI
- Reputation scoring on top of memory events
