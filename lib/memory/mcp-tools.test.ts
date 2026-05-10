import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  commitMemorySchema,
  getMemorySchema,
  listMemoriesSchema,
  verifyMemorySchema,
} from "./mcp-schemas";

// We test the schema shape only. The tool handlers themselves wrap thin
// queries against Supabase + the existing verify SDK, both already covered
// by their own tests / verified end-to-end by the demo flow.

describe("verify_memory / get_memory schemas", () => {
  const verify = z.object(verifyMemorySchema);
  const get = z.object(getMemorySchema);

  it("accepts a valid v4 uuid", () => {
    // Shape matches what gen_random_uuid() produces.
    const id = "11111111-1111-4111-8111-111111111111";
    expect(verify.parse({ memory_event_id: id })).toEqual({
      memory_event_id: id,
    });
    expect(get.parse({ memory_event_id: id })).toEqual({
      memory_event_id: id,
    });
  });

  it("rejects a non-uuid string", () => {
    expect(() => verify.parse({ memory_event_id: "not-a-uuid" })).toThrow();
    expect(() => get.parse({ memory_event_id: "" })).toThrow();
  });

  it("rejects missing field", () => {
    expect(() => verify.parse({})).toThrow();
    expect(() => get.parse({})).toThrow();
  });
});

describe("list_memories schema", () => {
  const schema = z.object(listMemoriesSchema);

  it("accepts an empty input (all optional)", () => {
    expect(schema.parse({})).toEqual({});
  });

  it("accepts an agent_slug only", () => {
    expect(schema.parse({ agent_slug: "hayato-momentum" })).toEqual({
      agent_slug: "hayato-momentum",
    });
  });

  it("accepts a limit within bounds", () => {
    expect(schema.parse({ limit: 10 })).toEqual({ limit: 10 });
    expect(schema.parse({ limit: 100 })).toEqual({ limit: 100 });
  });

  it("rejects negative or zero limit", () => {
    expect(() => schema.parse({ limit: 0 })).toThrow();
    expect(() => schema.parse({ limit: -1 })).toThrow();
  });

  it("rejects fractional limit", () => {
    expect(() => schema.parse({ limit: 2.5 })).toThrow();
  });

  it("rejects limit above the cap", () => {
    expect(() => schema.parse({ limit: 101 })).toThrow();
  });
});

describe("commit_memory schema", () => {
  const schema = z.object(commitMemorySchema);

  it("accepts an arbitrary JSON object as payload", () => {
    const parsed = schema.parse({
      payload: { content: "hi", confidence: 0.7, recorded_at: "2026-05-09" },
    });
    expect(parsed.payload).toEqual({
      content: "hi",
      confidence: 0.7,
      recorded_at: "2026-05-09",
    });
  });

  it("accepts an empty object payload", () => {
    expect(schema.parse({ payload: {} })).toEqual({ payload: {} });
  });

  it("preserves arbitrary extra fields verbatim (they're part of the hash)", () => {
    const exotic = {
      payload: { content: "x", custom_field: { nested: [1, 2] } },
    };
    expect(schema.parse(exotic).payload).toEqual(exotic.payload);
  });

  it("rejects a non-object payload", () => {
    expect(() => schema.parse({ payload: "string" })).toThrow();
    expect(() => schema.parse({ payload: 42 })).toThrow();
    expect(() => schema.parse({ payload: null })).toThrow();
  });

  it("rejects missing payload", () => {
    expect(() => schema.parse({})).toThrow();
  });
});
