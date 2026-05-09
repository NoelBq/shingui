import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import {
  COMMIT_MEMORY_DISCRIMINATOR,
  COMMIT_MEMORY_INSTRUCTION_LEN,
  SHINGI_PROGRAM_ID,
  decodeCommitMemoryIxData,
  encodeCommitMemoryIx,
} from "./program";

describe("encodeCommitMemoryIx", () => {
  it("produces a 72-byte instruction with the correct layout", () => {
    const signer = Keypair.generate().publicKey;
    const agent = Keypair.generate().publicKey;
    const hash = new Uint8Array(32).fill(0xab);

    const ix = encodeCommitMemoryIx({ signer, agent, hash });

    expect(ix.programId.equals(SHINGI_PROGRAM_ID)).toBe(true);
    expect(ix.keys).toHaveLength(1);
    expect(ix.keys[0].pubkey.equals(signer)).toBe(true);
    expect(ix.keys[0].isSigner).toBe(true);
    expect(ix.keys[0].isWritable).toBe(false);
    expect(ix.data.length).toBe(COMMIT_MEMORY_INSTRUCTION_LEN);

    const data = new Uint8Array(ix.data);
    for (let i = 0; i < 8; i++) {
      expect(data[i]).toBe(COMMIT_MEMORY_DISCRIMINATOR[i]);
    }
    expect(data.slice(8, 40)).toEqual(agent.toBytes());
    expect(data.slice(40, 72)).toEqual(hash);
  });

  it("rejects hashes that are not 32 bytes", () => {
    const signer = Keypair.generate().publicKey;
    const agent = Keypair.generate().publicKey;
    expect(() =>
      encodeCommitMemoryIx({ signer, agent, hash: new Uint8Array(31) }),
    ).toThrow(/32 bytes/);
  });
});

describe("decodeCommitMemoryIxData", () => {
  it("roundtrips an encoded instruction", () => {
    const signer = Keypair.generate().publicKey;
    const agent = Keypair.generate().publicKey;
    const hash = new Uint8Array(
      Array.from({ length: 32 }, (_, i) => (i * 7) & 0xff),
    );
    const ix = encodeCommitMemoryIx({ signer, agent, hash });

    const decoded = decodeCommitMemoryIxData(new Uint8Array(ix.data));

    expect(decoded.agent.equals(agent)).toBe(true);
    expect(decoded.hash).toEqual(hash);
  });

  it("rejects wrong-length data", () => {
    expect(() => decodeCommitMemoryIxData(new Uint8Array(70))).toThrow(
      /expected 72/,
    );
  });

  it("rejects mismatched discriminator", () => {
    const bad = new Uint8Array(72);
    bad[0] = 0xde; // not our discriminator
    expect(() => decodeCommitMemoryIxData(bad)).toThrow(/discriminator/);
  });
});
