# Handoff: Shingi brand + UI refresh

## Overview

Replaces the kanji-based brand mark with a graph/network logo system, adds matching banners (GitHub, X header, OG card), and refreshes three key app surfaces: the landing hero, the memory list, and the verify page (tampered state).

The project is the existing Next.js 16 / React 19 / Tailwind v4 app at the repo root (`shingi/`).

## About the design files

The HTML files in this bundle are **design references** — React prototypes rendered statically inside a pan/zoom design canvas. They are NOT meant to be copied verbatim into the codebase. The task is to **recreate these designs as real Next.js / Tailwind components** using the codebase's existing patterns:

- `app/globals.css` — design tokens live here (CSS custom properties on `:root`)
- `components/shared/` — site-header, site-footer, etc.
- `app/page.tsx`, `app/verify/[memoryEventId]/page.tsx` — the surfaces to update
- Tailwind v4 inline `@theme` block in `globals.css` exposes tokens as utilities (`bg-(--accent)` etc.)

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and component composition. Recreate pixel-perfectly using the codebase's existing Tailwind tokens — extend tokens where new ones are introduced (see Design tokens below).

## What's changing

### 1. Brand mark — drop the kanji entirely

The current header uses 真偽 + "Shingi" wordmark. Replace with the **graph mark**:

- 5 filled circles on a horizontal dashed line (top row — green, the "live ledger")
- Each circle has a vertical dashed trace down to a filled square (bottom row — violet, "onchain commits")
- Concept: many memories → one row → many commits. Reads as a merkle/commitment visual.

Wordmark: lowercase "shingi", Inter 500, letter-spacing ~0.16–0.18em. The kanji should be removed everywhere it currently appears (header, hero eyebrow pill, OG, footer, favicon).

### 2. New tagline option

`MEMORY · VERIFIED` (mono, uppercase, wide letter-spacing) replaces `TRUTH · FALSEHOOD · ONCHAIN` where appropriate. Either is fine — the eyebrow pill on the hero currently uses the truth/falsehood phrasing; the brand bundle uses MEMORY · VERIFIED. Pick one and use consistently.

### 3. Type pairing

- **UI / wordmark / headlines:** Inter (400/500/600/700)
- **Hashes / eyebrow text / mono labels:** JetBrains Mono (400/500/600)

These should be loaded via `next/font/google` in `app/layout.tsx` and exposed via the existing `--font-sans` / `--font-mono` CSS variables (the `@theme inline` block already wires them up).

### 4. Two-tone palette

Existing palette stays. **Add violet as a first-class token** (it already appears as a faint background glow in `globals.css`):

- `--accent` (#34d399) → "verified", live, ✓ — top circles in the graph mark
- `--accent-violet` (#a78bfa) **(new)** → "committed", onchain, hash → bottom squares in the graph mark
- All red/danger uses continue with `--danger` (#f87171)

This gives the graph mark its top/bottom split and gives hash strings a color to belong to (violet = onchain hash, green = verified/recomputed match).

## Screens

### A. Site header (`components/shared/site-header.tsx`)

- Replace the `<span className="kanji-mark">真偽</span> Shingi` block with `<GraphMark size={42} />` + lowercase "shingi" wordmark (Inter 500, tracking 0.16em)
- Keep the existing nav links + WalletButton
- Add a "devnet" status pill on the right (mono, uppercase, dot indicator)

### B. Landing hero (`app/page.tsx`)

Two-column layout (`grid-cols-[1.05fr_1fr]`, gap 64px), max-width 1280, padding 72px 64px:

**Left column:**
- Eyebrow pill: rounded-full, border, surface bg, mono 10px / 0.28em uppercase. Dot + text "memory · verified · onchain"
- Headline: Inter 600, ~68px, line-height 1.02, letter-spacing -0.035em. "Tamper-proof memory for *autonomous AI agents*." Accent green on the highlighted span.
- Body: Inter 400, 17px, color `--muted`, max-width 520
- Buttons: filled green ("Browse memories →") + outline ("Read the spec"). Both rounded-full, padding 12×22, font-weight 600.
- "Built on" strip: mono 11px, uppercase, with vertical separators. Solana / Anchor / Supabase.

**Right column — `<VerificationCard />`:**
- Surface card, border, radius 18, padding 24, glow shadow
- Header row: "memory event · #4892" + green "verified" pill (with glowing dot)
- Agent row: 32×32 violet-tinted avatar + agent name + ISO timestamp
- Code block: dark bg, mono, payload JSON with syntax-tinted keys
- Hash flow:
  - "recomputed sha-256" label + green hash
  - dashed divider with `= MATCH ✓` in green mono
  - "onchain commit · slot 358,192,044" + violet hash
- Footer: tx id + "view on solscan ↗" link

Background: existing radial green glow + add a violet glow bottom-right + faint 32px grid (already exists as `.shingi-grid`).

### C. Memory list (`app/page.tsx` — replaces the existing `<ul>` of cards)

Switch from card list to a **proper table**, inside a single rounded surface container.

- Eyebrow: "live ledger" (mono, 0.28em tracking, accent color)
- H2: "Recent memories" (Inter 600, 36px, -0.025em)
- Filter pills row on the right: All agents (active = accent border + tinted bg) / kage-trader / neko-arb / kitsune-mm

Table columns (`grid-cols-[140px_70px_1fr_110px_200px_90px]`, gap 16, padding 14×18):
1. Agent (Inter 600, 13px)
2. Time (mono, 11px, muted)
3. Thought (Inter 400, 13px, truncate)
4. Confidence — bar + 2-decimal value (`<ConfBar />`: 4px height bar, accent fill on border bg)
5. Hash — `0x` + truncated, **violet** if ok, **danger** if tampered
6. Status — pill: "✓ ok" (green) or "✕ tamper" (red)

First row gets a subtle `bg-(--accent)/[0.04]` highlight.

### D. Verify page (`app/verify/[memoryEventId]/page.tsx`) — tampered state

Above-fold status banner:
- Border `--danger`/55, rounded-2xl, gradient bg from `--danger`/10% to /3%
- Left: 44×44 X icon in tinted square + "TAMPERED · HASH MISMATCH" eyebrow + "Payload changed after onchain commit." headline
- Right: tiny inline graph mark (5 nodes) with one square rotated and recolored red — visualizes which node failed verification

Side-by-side **diff cards** (2-col grid):
- "Recomputed (live payload)" with red status dot + JSON with the changed field highlighted in red
- "Onchain commit" with violet status dot + JSON with the original value highlighted in violet
- Both cards show their hash at the bottom in mono

4-up meta grid below: Agent / Slot / Block time / Tx — each a small surface card with mono uppercase label + value.

## Components to create

```
components/
  brand/
    graph-mark.tsx         // The 5-node graph SVG (props: size, top, bottom, count, lineColor)
    wordmark.tsx           // Lowercase Inter "shingi" (props: size, color, letterSpacing)
    tagline.tsx            // MEMORY · VERIFIED mono uppercase
    logo-lockup.tsx        // GraphMark + Wordmark + Tagline (variants: primary, horizontal, inline)
  shared/
    devnet-pill.tsx        // Status pill with dot + cluster name
  hero/
    verification-card.tsx  // The hero right-column card
  memory/
    memory-table.tsx       // Replaces the recent-memories list
    conf-bar.tsx           // Inline 4px confidence bar
    status-pill.tsx        // ✓ ok / ✕ tamper
  verify/
    status-banner.tsx      // Top banner — accepts status="ok"|"tampered"
    diff-card.tsx          // Side-by-side payload card
    meta-grid.tsx          // 4-up Agent/Slot/Time/Tx
```

## Design tokens — update `app/globals.css`

```css
:root {
  --background: #07080c;
  --foreground: #e7e9ee;
  --surface: #0d1018;
  --surface-elevated: #131826;
  --border: #1f2433;
  --muted: #8b91a3;

  --accent: #34d399;            /* green — verified */
  --accent-foreground: #052e1d;
  --accent-violet: #a78bfa;     /* NEW — committed/onchain */
  --accent-violet-foreground: #1c0f3d;

  --danger: #f87171;
  --warning: #fbbf24;
}
```

Add to `@theme inline`:
```css
--color-accent-violet: var(--accent-violet);
--color-accent-violet-foreground: var(--accent-violet-foreground);
```

## Typography

```css
/* In layout.tsx via next/font */
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400","500","600","700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500","600"] });
```

(Replace whatever Geist setup is currently there.)

Type scale used in designs:
- Headline XL (hero): 68px / 1.02 / -0.035em / 600
- Headline L (section): 36px / 1.1 / -0.025em / 600
- Headline M (card): 22px / 1.2 / -0.02em / 600
- Body L: 17–18px / 1.5 / 400
- Body: 14px / 1.5 / 400/500
- Mono S: 11–12px / 1.5 / 500
- Eyebrow: 10–11px mono / 0.22–0.28em tracking / uppercase

## Spacing & shape

- Card radius: 14–18px
- Pill radius: 999
- Grid gaps: 16 / 24 / 64
- Section padding: 40–80 vertical, 32–64 horizontal
- Faint 32px grid overlay (already in `.shingi-grid`) on hero + verify page

## Banners (one-shot images)

Three banner sizes are included in the prototype, but they're not part of the live app:

- **GitHub README**: 1280×640
- **X / Twitter header**: 1500×500
- **Open Graph card**: 1200×630

These can be exported as PNGs from the prototype (the canvas focus mode lets you screenshot any artboard at design size). Place under `public/brand/` and wire OG via `app/layout.tsx` metadata once exported.

## Files in this bundle

- `Shingi Brand & UI.html` — open this to see the canvas
- `design-canvas.jsx` — the canvas runtime
- `brand/logos.jsx` — all logo lockups + the `GraphMark` SVG (ground-truth for sizing/colors)
- `brand/banners.jsx` — banner compositions
- `brand/ui.jsx` — hero, memory list, verify page mocks

## Implementation order (suggested)

1. Update `globals.css` tokens + typography (Inter + JetBrains Mono)
2. Build `<GraphMark />` first — it appears in the header, hero card, banners, and verify banner
3. Update `<SiteHeader />` to use it (smallest blast radius)
4. Build the verification card + drop it into the hero
5. Replace recent-memories list with the table
6. Update the verify page tampered banner + diff cards
7. Export the three banners as PNGs and wire OG metadata

## Out of scope for this handoff

- Wallet connect flow (left as-is)
- Solana program contract changes
- The seed/admin route — purely server, no UI changes
