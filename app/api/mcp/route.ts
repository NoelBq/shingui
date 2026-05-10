import {
  createMcpHandler,
  experimental_withMcpAuth as withMcpAuth,
} from "mcp-handler";
import {
  commitMemorySchema,
  getMemorySchema,
  listMemoriesSchema,
  verifyMemorySchema,
} from "@/lib/memory/mcp-schemas";
import {
  commitMemoryTool,
  getMemoryTool,
  listMemoriesTool,
  verifyMemoryTool,
} from "@/lib/memory/mcp-tools";
import { findAgentByApiKey } from "@/lib/memory/api-key";

// Shingi MCP server.
//
// Endpoint: POST /api/mcp (streamable HTTP transport).
// Auth: optional. Read tools (verify, list, get) work anonymously. The
// commit_memory write tool requires Authorization: Bearer sk_shingi_<key>;
// the bearer is resolved to an agent identity and that agent's keypair
// signs the on-chain tx (admin keypair pays fees).
//
// Connect from Claude Code (read-only):
//   claude mcp add shingi --transport http http://localhost:3000/api/mcp
//
// Connect with an agent's API key (read + commit):
//   claude mcp add shingi --transport http http://localhost:3000/api/mcp \
//     --header "Authorization: Bearer sk_shingi_<key>"

const baseHandler = createMcpHandler(
  (server) => {
    server.tool(
      "verify_memory",
      "Verify a memory event. Recomputes sha256(canonicalJson(payload)) from the live Postgres row and compares it to the hash committed onchain in the referenced Solana transaction. Returns ok=true when the live payload matches the onchain commit, ok=false when tampered. The hash is intentionally not stored in Postgres — only the tx signature is — so the verifier always recomputes from the current payload.",
      verifyMemorySchema,
      async (input) => {
        const result = await verifyMemoryTool(input);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
          isError: "not_found" in result && result.not_found === true,
        };
      },
    );

    server.tool(
      "list_memories",
      "List recent memory events anchored to Solana. Each entry includes the agent's name, slug, onchain pubkey (the signer of that memory's commit_memory tx), the live payload, and the Solana tx signature. Optionally filter by agent_slug. Use this to browse what an agent has recorded before deciding whether to verify any specific memory.",
      listMemoriesSchema,
      async (input) => {
        const result = await listMemoriesTool(input);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      },
    );

    server.tool(
      "get_memory",
      "Fetch one memory event with its live payload, agent identity, and Solana tx signature. Does NOT verify the hash — call verify_memory if you need the integrity check.",
      getMemorySchema,
      async (input) => {
        const result = await getMemoryTool(input);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
          isError: "not_found" in result && result.not_found === true,
        };
      },
    );

    server.tool(
      "commit_memory",
      "Record a new memory event onchain under the calling agent's identity. Requires Authorization: Bearer sk_shingi_<key>; the bearer must be a valid agent API key (issued during provisioning). The payload is canonical-JSON-hashed, the hash is committed in a Solana commit_memory tx signed by the agent's own keypair, and a memory_events row is inserted in Postgres pointing at the tx. Returns { memoryEventId, txSig } — verify_memory(memoryEventId) will return ok=true immediately after.",
      commitMemorySchema,
      async (input, extra) => {
        const auth = extra.authInfo;
        const agentId = (auth?.extra as { agentId?: string } | undefined)
          ?.agentId;
        if (!agentId) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "authorization required",
                  detail:
                    "commit_memory requires an agent API key. Send Authorization: Bearer sk_shingi_<key> with the request.",
                }),
              },
            ],
            isError: true,
          };
        }
        try {
          const result = await commitMemoryTool({
            agentId,
            payload: input.payload,
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(result, null, 2) },
            ],
          };
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "commit_failed",
                  detail: e instanceof Error ? e.message : String(e),
                }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  },
  {},
  {
    streamableHttpEndpoint: "/api/mcp",
    disableSse: true,
  },
);

// Auth wrapper: optional bearer. Anonymous requests still hit the server
// (so read tools work), but extra.authInfo will be undefined — the
// commit_memory handler checks for it.
const handler = withMcpAuth(
  baseHandler,
  async (_req, bearerToken) => {
    if (!bearerToken) return undefined;
    const agent = await findAgentByApiKey(bearerToken);
    if (!agent) return undefined;
    return {
      token: bearerToken,
      clientId: agent.slug,
      scopes: ["commit_memory"],
      extra: { agentId: agent.id, agentSlug: agent.slug },
    };
  },
  { required: false },
);

export { handler as GET, handler as POST, handler as DELETE };
