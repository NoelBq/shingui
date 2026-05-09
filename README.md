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

| Layer | What lives there | Mutability |
|---|---|---|
| Postgres `memory_events` | `payload jsonb`, `solana_tx_sig` | Operator-controlled (mutable) |
| Solana | One `commit_memory(agent, hash)` tx per event | Consensus-stamped (immutable) |

The hash is **not** stored in Postgres. The verifier always recomputes `sha256(canonicalJson(payload))` from the live row and compares to the onchain commit. A stored hash would just be another field the operator can edit.

## Demo flow

1. Visit `/` — landing page with three pillars and (when admin is enabled) a "Seed memories" button.
2. Click **Seed memories (admin)** — server commits 6 memory events to devnet using the admin keypair.
3. Click any memory in the **Recent memories** list → `/verify/[id]` page.
4. Status banner shows ✅ **Verified · untouched** with the onchain block_time.
5. Click **Tamper this memory** — backend mutates `payload.confidence` in Postgres.
6. Page refreshes → ❌ **Tampered · hash mismatch**, with a Solscan link to the original commit.

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

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key (read-only RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service role key for server inserts (seed + tamper routes) |
| `SHINGI_ADMIN_KEYPAIR` | yes | JSON array of 64 bytes — the keypair that signs `commit_memory` txs from the admin seed route. Generate with `solana-keygen new -o /tmp/admin.json --no-bip39-passphrase --silent` and paste the file contents. **Fund it on devnet** before seeding. |
| `NEXT_PUBLIC_SHINGI_ADMIN_ENABLED` | no | Set to `"true"` to show the "Seed memories" button on the landing page |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | no | Override RPC endpoint (default: `https://api.devnet.solana.com`). Used by both server and wallet adapter. |
| `SOLANA_RPC_URL` | no | Server-only RPC override (takes precedence over `NEXT_PUBLIC_SOLANA_RPC_URL`). Useful if you have a paid endpoint server-side. |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | no | Used to build Solscan links. Default: `devnet`. Set to `mainnet` for production. |

## Known limitations (acknowledged)

- **Memory-hole attack:** the operator can simply delete a `memory_events` row. Pattern A doesn't fix this; v2 addresses it via mirroring or Merkle batches.
- **Truth:** the system proves the payload hasn't been edited, not that the agent's claim was correct. The agent could have hallucinated and committed a hallucination.
- **Single signer:** all demo memories are signed by the admin keypair. Real deployments would have each agent sign with its own key.

## Tests

```sh
bun run test    # vitest: hash core + program client encode/decode
cargo test --manifest-path programs/shingi/Cargo.toml   # LiteSVM
```

## Out of scope (v2)

- SIWS / wallet-based login session
- Pattern C Merkle batching + indexer
- Real AI agents calling `commitMemory` directly
- Multi-agent dispute UI
- Reputation scoring on top of memory events
