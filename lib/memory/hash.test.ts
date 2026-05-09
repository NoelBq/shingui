import { describe, expect, it } from "vitest";
import {
  bytesToHex,
  canonicalJson,
  hashPayloadHex,
  hexToBytes,
} from "./hash";

describe("canonicalJson", () => {
  it("sorts object keys lexicographically", () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
  });

  it("sorts nested object keys", () => {
    expect(canonicalJson({ outer: { z: 1, a: 2 } })).toBe(
      '{"outer":{"a":2,"z":1}}',
    );
  });

  it("preserves array order (order is meaningful)", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
  });

  it("emits no whitespace", () => {
    expect(canonicalJson({ a: [1, 2], b: { c: 3 } })).toBe(
      '{"a":[1,2],"b":{"c":3}}',
    );
  });

  it("handles null, booleans, numbers, strings", () => {
    expect(canonicalJson(null)).toBe("null");
    expect(canonicalJson(true)).toBe("true");
    expect(canonicalJson(false)).toBe("false");
    expect(canonicalJson(42)).toBe("42");
    expect(canonicalJson(3.14)).toBe("3.14");
    expect(canonicalJson("hi")).toBe('"hi"');
  });

  it("escapes string contents like JSON.stringify", () => {
    expect(canonicalJson('a"b\\c')).toBe('"a\\"b\\\\c"');
  });

  it("throws on non-finite numbers", () => {
    expect(() => canonicalJson(NaN)).toThrow(/non-finite/);
    expect(() => canonicalJson(Infinity)).toThrow(/non-finite/);
  });

  it("throws on undefined values inside objects", () => {
    expect(() => canonicalJson({ a: undefined })).toThrow(/undefined/);
  });
});

describe("hashPayloadHex", () => {
  it("is deterministic for the same payload", async () => {
    const payload = { content: "test", confidence: 0.7 };
    const a = await hashPayloadHex(payload);
    const b = await hashPayloadHex(payload);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is invariant to object key insertion order", async () => {
    const a = await hashPayloadHex({ a: 1, b: 2, c: 3 });
    const b = await hashPayloadHex({ c: 3, a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it("is invariant to nested key order", async () => {
    const a = await hashPayloadHex({ wrap: { x: 1, y: 2 } });
    const b = await hashPayloadHex({ wrap: { y: 2, x: 1 } });
    expect(a).toBe(b);
  });

  it("changes when any value changes (the tamper case)", async () => {
    const before = await hashPayloadHex({ confidence: 0.7 });
    const after = await hashPayloadHex({ confidence: 0.9 });
    expect(before).not.toBe(after);
  });

  it("changes when array order changes", async () => {
    const a = await hashPayloadHex({ list: [1, 2, 3] });
    const b = await hashPayloadHex({ list: [3, 2, 1] });
    expect(a).not.toBe(b);
  });
});

describe("bytesToHex / hexToBytes", () => {
  it("roundtrips arbitrary bytes", () => {
    const original = new Uint8Array([0, 1, 2, 0x9a, 0xff]);
    expect(hexToBytes(bytesToHex(original))).toEqual(original);
  });

  it("strips an 0x prefix", () => {
    expect(hexToBytes("0xff")).toEqual(new Uint8Array([0xff]));
  });

  it("throws on odd-length input", () => {
    expect(() => hexToBytes("abc")).toThrow(/even/);
  });
});
