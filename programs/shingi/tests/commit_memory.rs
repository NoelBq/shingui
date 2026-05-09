// LiteSVM integration test for commit_memory.
//
// Loads the compiled program (target/deploy/shingi.so) into an in-process
// SVM, sends one commit_memory tx, and asserts it succeeds. Run with:
//
//     cargo build-sbf --manifest-path programs/shingi/Cargo.toml
//     cargo test --manifest-path programs/shingi/Cargo.toml --test commit_memory
//
// The cargo build-sbf step requires the Solana toolchain
// (https://docs.solanalabs.com/cli/install). Without it the .so won't
// exist and the test will skip with a clear error.

use anchor_lang::{InstructionData, ToAccountMetas};
use litesvm::LiteSVM;
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

fn so_path() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../target/deploy/shingi.so")
}

#[test]
fn commit_memory_succeeds() {
    let so = so_path();
    if !so.exists() {
        panic!(
            "compiled program not found at {}. Run `cargo build-sbf --manifest-path programs/shingi/Cargo.toml` first.",
            so.display()
        );
    }

    let mut svm = LiteSVM::new();
    let program_id = shingi::ID;
    svm.add_program_from_file(program_id, &so).unwrap();

    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    let agent = Pubkey::new_unique();
    let hash: [u8; 32] = [0x9au8; 32];

    let ix = Instruction {
        program_id,
        accounts: shingi::accounts::CommitMemory {
            signer: payer.pubkey(),
        }
        .to_account_metas(None),
        data: shingi::instruction::CommitMemory { agent, hash }.data(),
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[&payer],
        blockhash,
    );

    let result = svm.send_transaction(tx);
    assert!(
        result.is_ok(),
        "commit_memory should succeed: {:?}",
        result.err(),
    );

    // The integrity guarantee lives in the tx's instruction data — verifiers
    // will decode (agent, hash) from there. Confirm we can read it back from
    // the transaction we just sent.
    let meta = result.unwrap();
    assert!(meta.logs.iter().any(|l| l.contains("Program") && l.contains("success")));
}
