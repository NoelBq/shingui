<claude-mem-context>
# Memory Context

# [shingi] recent context, 2026-05-09 10:14pm GMT-3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 26 obs (8,578t read) | 174,615t work | 95% savings

### May 9, 2026
370 8:01p 🔵 Seed memories endpoint commits trading agent memories to Solana
371 " 🔵 Verify page and tamper detection endpoints not yet implemented
372 " 🟣 Landing page displays memory events with hash-verification and auditability messaging
373 8:02p 🟣 Verify page implements full hash validation and tamper detection UI
374 " 🟣 Demo tamper endpoint mutates Postgres payload to trigger hash mismatch
375 " 🔵 Data model emphasizes recompute-on-verify by never storing the hash
376 8:06p 🔵 Dev server fails to start: port 3000 already in use or permission denied
377 8:12p 🔵 Design handoff folder structure mapped for UI Polish
378 8:13p 🔵 Design handoff specification: brand refresh and UI redesign
379 " 🔵 Current Shingi codebase baseline: kanji brand, Geist fonts, three target surfaces identified
380 8:14p 🔵 Kanji branding appears in footer and metadata; seed endpoint provides test data
381 8:19p 🔵 Eight themed trading agents seeded for testing; project on GitHub
382 " ✅ Design tokens updated: violet accent color added, font variables prepared
383 8:20p ✅ Removed kanji-mark styles; added grid-mask utility class
384 " ✅ Typography system updated: Geist → Inter + JetBrains Mono; kanji removed from metadata
385 " 🟣 GraphMark component created: 5-node SVG brand mark
386 8:21p 🟣 Wordmark component created: lowercase "shingi" text mark
387 " 🟣 DevnetPill component created: network status indicator
388 " ✅ Site header updated: replaced kanji branding with graph mark + wordmark + devnet pill
389 " ✅ Site footer updated: replaced kanji with graph mark and new tagline
390 " 🟣 VerificationCard component created: hash flow visualization
391 8:23p ✅ VerificationCard refactored: changed from Link wrapper to div with split actions
392 " 🟣 ConfBar component created: inline confidence indicator
393 " 🟣 MemoryTable component created: data table for recent memories
394 8:24p ✅ Landing page redesigned: hero with verification card + memory table with agent filtering
S157 Determine the best approach for API documentation within the hackathon timeframe and how it impacts the pitch narrative (May 9 at 9:43 PM)
S158 Analyze database schema impact and security risks of adding a public API to the Shingi memory system (May 9 at 9:45 PM)
395 9:45p 🔵 Existing commitMemoryServer function is reusable for API implementation
S159 Identify concrete security attack vectors against the API with exploitation examples and mitigation costs (May 9 at 9:46 PM)
S160 Review and evaluate Shingi project scope to confirm it's the right architectural approach for addressing integration gaps (May 9 at 9:48 PM)
S161 Architectural decision: custodial vs client-signed API models—which pattern better serves integration story and hackathon demo (May 9 at 9:49 PM)
S162 Determine optimal deployment architecture for the API—separate service vs integrated with existing Next.js app (May 9 at 9:50 PM)
S163 Financial risk analysis of token leak scenarios across API models and blockchain networks (May 9 at 9:51 PM)
S164 Input validation strategy comparison—individual guards vs consolidated schema-based approach for API payload protection (May 9 at 9:52 PM)
S165 Clarifying MCP approach for Shingi: Understanding how Model Context Protocol integrates with Solana-based agent memory integrity verification (May 9 at 9:53 PM)
S166 Architectural pivot evaluation—REST API vs MCP (Model Context Protocol) as primary integration surface for Shingi (May 9 at 9:55 PM)
**Investigated**: MCP protocol capabilities and agent-native patterns; stdio vs HTTP MCP deployment modes; local wallet access implications for client-signed transactions; Claude Desktop MCP support status and maturity; demo experience comparison (UI clicking vs live agent tool invocation); threat model differences between remote (REST) and local (MCP) services

**Learned**: MCP is fundamentally more on-brand for "tamper-proof memory for AI agents" than REST—agents configure one line and get native memory tools. Demo beat is decisively stronger with MCP: live Claude Desktop showing agent calling `commit_memory`, seeing tx fire onchain, then calling `verify_memory` and catching tampering in real-time—far more compelling than human clicking UI. Stdio MCP (recommended over HTTP for hackathon) runs locally as subprocess with natural access to user's wallet and RPC, pairs perfectly with client-signed Model C (user's own wallet signs txs). Can eliminate entire bearer-token/rate-limit/DoS guard complexity—stdio is local-only, single-user per instance. Time cost similar (~3 hr vs ~2.5 hr REST) but scope is tighter and story sharper.

**Completed**: Full architectural comparison completed (REST vs MCP with concrete tool/resource definitions); deployment mode analysis (stdio vs HTTP); demo experience evaluation; threat model reassessment for MCP; revised scope defined with items to keep/drop; recommendation issued (MCP-primary pivot)

**Next Steps**: Awaiting user confirmation on MCP pivot. If confirmed, Claude will write propose-first plan for MCP-primary architecture: MCP server (stdio, three tools + two resources) + slim public `/api/verify/[id]` endpoint + docs page (rewritten around MCP install) + Claude Desktop example config. Total scope ~3–3.5 hr


Access 175k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>