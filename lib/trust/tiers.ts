import type { Tier } from "@/types";

export interface TierStyle {
  tier: Tier;
  label: string;
  range: [number, number];
  text: string;
  bg: string;
  ring: string;
  glow: string;
}

export const TIERS: TierStyle[] = [
  {
    tier: "Untested",
    label: "Untested",
    range: [0, 300],
    text: "text-slate-300",
    bg: "bg-slate-800/60",
    ring: "ring-slate-600/40",
    glow: "shadow-[0_0_24px_-12px_rgba(148,163,184,0.6)]",
  },
  {
    tier: "Emerging",
    label: "Emerging",
    range: [301, 500],
    text: "text-amber-300",
    bg: "bg-amber-950/60",
    ring: "ring-amber-500/40",
    glow: "shadow-[0_0_24px_-10px_rgba(251,191,36,0.6)]",
  },
  {
    tier: "Reliable",
    label: "Reliable",
    range: [501, 700],
    text: "text-sky-300",
    bg: "bg-sky-950/60",
    ring: "ring-sky-500/40",
    glow: "shadow-[0_0_24px_-10px_rgba(56,189,248,0.6)]",
  },
  {
    tier: "Trusted",
    label: "Trusted",
    range: [701, 850],
    text: "text-emerald-300",
    bg: "bg-emerald-950/60",
    ring: "ring-emerald-500/40",
    glow: "shadow-[0_0_24px_-10px_rgba(52,211,153,0.6)]",
  },
  {
    tier: "Elite",
    label: "Elite",
    range: [851, 1000],
    text: "text-violet-300",
    bg: "bg-violet-950/60",
    ring: "ring-violet-500/40",
    glow: "shadow-[0_0_28px_-8px_rgba(167,139,250,0.7)]",
  },
];

export function tierForScore(score: number): TierStyle {
  for (const t of TIERS) {
    if (score >= t.range[0] && score <= t.range[1]) return t;
  }
  return TIERS[0];
}
