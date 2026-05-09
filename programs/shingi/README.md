# shingi (program)

Single-instruction Anchor program for Shingi: `commit_memory(agent: Pubkey, hash: [u8;32])`.

The hash lives in the **instruction data** of the transaction. Verifiers decode `(agent, hash)` from `getTransaction` and compare against a hash recomputed from the off-chain payload. Block timestamp comes from consensus, so backdating is detectable.

## Program ID

`HqhhtfTNUoVA86BF7UE9kaG4tJQW6NCftmTRC6PgtbC7` (devnet + localnet).

The keypair lives at `programs/shingi/shingi-keypair.json`. It is committed because this is a hackathon project on devnet — do not reuse it for anything beyond this demo, and never deploy to mainnet without rotating.

## Build

Requires the Solana toolchain (`cargo build-sbf`). Install: <https://docs.solanalabs.com/cli/install>.

```sh
cargo build-sbf --manifest-path programs/shingi/Cargo.toml
```

Output: `target/deploy/shingi.so`.

## Test (LiteSVM)

```sh
cargo build-sbf --manifest-path programs/shingi/Cargo.toml
cargo test --manifest-path programs/shingi/Cargo.toml
```

The integration test in `tests/commit_memory.rs` loads the compiled `.so` into LiteSVM, sends one `commit_memory` tx, and asserts it succeeds.

## Deploy to devnet

```sh
solana config set --url devnet
solana airdrop 2
anchor deploy --provider.cluster devnet
```

(Requires the keypair at `programs/shingi/shingi-keypair.json` to be funded on devnet.)

## What this program does NOT do

- Store hashes onchain beyond the transaction itself.
- Vouch for the truth of the agent's memory. The hash proves the payload hasn't been edited since commit — not that the agent's claim was correct.
- Prevent the operator from deleting Postgres rows (memory-hole attack). Pattern A acknowledged limitation; v2 addresses with mirroring/Merkle batches.
