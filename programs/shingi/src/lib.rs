// Shingi commit_memory program.
//
// One instruction. The hash of the agent's memory payload is passed as
// instruction data. The integrity guarantee is the Solana transaction
// itself: anyone fetching this tx can decode (agent, hash) from the
// instruction args and compare to a hash recomputed from the off-chain
// payload. Block timestamp comes from consensus, so backdating is
// detectable by the verifier.
//
// What this program does NOT do:
// - It does not store the hash anywhere onchain beyond the tx itself.
// - It does not vouch for the truth of the agent's memory — only that
//   the payload hashed at commit time has not been edited since.

use anchor_lang::prelude::*;

declare_id!("HqhhtfTNUoVA86BF7UE9kaG4tJQW6NCftmTRC6PgtbC7");

#[program]
pub mod shingi {
    use super::*;

    pub fn commit_memory(
        _ctx: Context<CommitMemory>,
        agent: Pubkey,
        hash: [u8; 32],
    ) -> Result<()> {
        let _ = (agent, hash);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CommitMemory<'info> {
    pub signer: Signer<'info>,
}
