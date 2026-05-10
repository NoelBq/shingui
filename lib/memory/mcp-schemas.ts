import { z } from "zod";

export const verifyMemorySchema = {
  memory_event_id: z
    .string()
    .uuid()
    .describe("UUID of the memory event to verify."),
};

export const listMemoriesSchema = {
  agent_slug: z
    .string()
    .optional()
    .describe(
      "Filter by agent slug (e.g. 'hayato-momentum'). Omit for all agents.",
    ),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe("Max rows to return. Defaults to 50, hard cap 100."),
};

export const getMemorySchema = {
  memory_event_id: z
    .string()
    .uuid()
    .describe("UUID of the memory event to fetch."),
};

export const commitMemorySchema = {
  payload: z
    .record(z.string(), z.unknown())
    .describe(
      "Free-form JSON object to record. Conventional fields: content (string), recorded_at (ISO timestamp), confidence (0..1). Any extra fields are preserved verbatim — they're part of the integrity hash.",
    ),
};
