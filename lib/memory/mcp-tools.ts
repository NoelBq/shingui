import "server-only";

import { verifyMemory } from "./verify";
import { getMemory, listMemories } from "./list";
import { commitMemoryServer } from "./commit";
import { getRpcConnection } from "./connection";
import type { MemoryPayload } from "@/types";

// Tool handler outputs are JSON-serialized into a `text` content block by
// the route layer. Returning plain objects keeps these handlers easy to
// reuse outside MCP if we ever want to.

export async function verifyMemoryTool(input: { memory_event_id: string }) {
  const result = await verifyMemory(input.memory_event_id);
  if (!result) {
    return {
      ok: false as const,
      not_found: true,
      memory_event_id: input.memory_event_id,
      message: `No memory event with id ${input.memory_event_id}.`,
    };
  }
  return result;
}

export async function listMemoriesTool(input: {
  agent_slug?: string;
  limit?: number;
}) {
  const items = await listMemories({
    agentSlug: input.agent_slug,
    limit: input.limit,
  });
  return {
    count: items.length,
    items,
  };
}

export async function getMemoryTool(input: { memory_event_id: string }) {
  const item = await getMemory(input.memory_event_id);
  if (!item) {
    return {
      not_found: true,
      memory_event_id: input.memory_event_id,
      message: `No memory event with id ${input.memory_event_id}.`,
    };
  }
  return item;
}

// Authenticated. The MCP route's auth wrapper resolves a bearer API key to
// an agent_id and passes it here. The agent's keypair (loaded server-side
// from agents.secret_key) signs the commit_memory tx; the admin keypair
// pays the fee. The result includes the new memory_event_id and tx_sig so
// the caller can immediately verify_memory(memory_event_id) if desired.
export async function commitMemoryTool(input: {
  agentId: string;
  payload: Record<string, unknown>;
}) {
  return commitMemoryServer({
    connection: getRpcConnection(),
    agentId: input.agentId,
    payload: input.payload as MemoryPayload,
  });
}
