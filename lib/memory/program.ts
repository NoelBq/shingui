// commit_memory instruction data layout (72 bytes):
//   bytes  0..7   discriminator = sha256("global:commit_memory")[0..8]
//   bytes  8..39  agent: Pubkey (32 raw bytes)
//   bytes 40..71  hash:  [u8; 32]

import {
  PublicKey,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";

export const SHINGI_PROGRAM_ID = new PublicKey(
  "HqhhtfTNUoVA86BF7UE9kaG4tJQW6NCftmTRC6PgtbC7",
);

// sha256("global:commit_memory")[0..8]
export const COMMIT_MEMORY_DISCRIMINATOR = new Uint8Array([
  75, 239, 115, 244, 228, 46, 213, 207,
]);

export const COMMIT_MEMORY_INSTRUCTION_LEN = 8 + 32 + 32;

export function encodeCommitMemoryIx(params: {
  signer: PublicKey;
  agent: PublicKey;
  hash: Uint8Array;
}): TransactionInstruction {
  if (params.hash.length !== 32) {
    throw new Error(
      `encodeCommitMemoryIx: hash must be 32 bytes, got ${params.hash.length}`,
    );
  }
  const data = new Uint8Array(COMMIT_MEMORY_INSTRUCTION_LEN);
  data.set(COMMIT_MEMORY_DISCRIMINATOR, 0);
  data.set(params.agent.toBytes(), 8);
  data.set(params.hash, 40);
  return new TransactionInstruction({
    programId: SHINGI_PROGRAM_ID,
    keys: [{ pubkey: params.signer, isSigner: true, isWritable: false }],
    data: Buffer.from(data),
  });
}

export interface DecodedCommitMemory {
  agent: PublicKey;
  hash: Uint8Array;
}

export function decodeCommitMemoryIxData(
  data: Uint8Array,
): DecodedCommitMemory {
  if (data.length !== COMMIT_MEMORY_INSTRUCTION_LEN) {
    throw new Error(
      `decodeCommitMemoryIxData: expected ${COMMIT_MEMORY_INSTRUCTION_LEN} bytes, got ${data.length}`,
    );
  }
  for (let i = 0; i < 8; i++) {
    if (data[i] !== COMMIT_MEMORY_DISCRIMINATOR[i]) {
      throw new Error(
        "decodeCommitMemoryIxData: instruction discriminator mismatch — this is not a commit_memory instruction",
      );
    }
  }
  return {
    agent: new PublicKey(data.slice(8, 40)),
    hash: data.slice(40, 72),
  };
}

export async function decodeCommitMemoryFromTx(
  connection: Connection,
  txSig: string,
): Promise<{
  decoded: DecodedCommitMemory;
  blockTime: number | null;
  signer: PublicKey | null;
}> {
  const tx = await connection.getTransaction(txSig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) {
    throw new Error(
      `decodeCommitMemoryFromTx: transaction ${txSig} not found on this RPC`,
    );
  }

  type MessageShape = {
    accountKeys?: PublicKey[];
    staticAccountKeys?: PublicKey[];
    instructions?: ReadonlyArray<{
      programIdIndex: number;
      accounts: number[];
      data: string;
    }>;
    compiledInstructions?: ReadonlyArray<{
      programIdIndex: number;
      accountKeyIndexes: number[];
      data: Uint8Array;
    }>;
  };
  const message = tx.transaction.message as unknown as MessageShape;
  const accountKeys = message.staticAccountKeys ?? message.accountKeys ?? [];
  const instructions =
    message.compiledInstructions ?? message.instructions ?? [];

  for (const ix of instructions) {
    const programId = accountKeys[ix.programIdIndex];
    if (!programId || !programId.equals(SHINGI_PROGRAM_ID)) continue;
    const raw =
      ix.data instanceof Uint8Array
        ? ix.data
        : Uint8Array.from(decodeBase58(ix.data as string));
    const decoded = decodeCommitMemoryIxData(raw);

    const accountIndexes =
      "accountKeyIndexes" in ix
        ? (ix as { accountKeyIndexes: number[] }).accountKeyIndexes
        : (ix as { accounts: number[] }).accounts;
    const signerIndex = accountIndexes?.[0];
    const signer =
      signerIndex !== undefined ? accountKeys[signerIndex] ?? null : null;

    return {
      decoded,
      blockTime: tx.blockTime ?? null,
      signer,
    };
  }
  throw new Error(
    `decodeCommitMemoryFromTx: no commit_memory instruction found in tx ${txSig}`,
  );
}

function decodeBase58(str: string): number[] {
  const ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const map: Record<string, number> = {};
  for (let i = 0; i < ALPHABET.length; i++) map[ALPHABET[i]] = i;
  const bytes: number[] = [0];
  for (const ch of str) {
    const v = map[ch];
    if (v === undefined) {
      throw new Error(`decodeBase58: invalid character "${ch}"`);
    }
    let carry = v;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const ch of str) {
    if (ch !== "1") break;
    bytes.push(0);
  }
  return bytes.reverse();
}
