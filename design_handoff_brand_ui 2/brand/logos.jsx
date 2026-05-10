/* Shingi logo + brand — graph mark, no kanji */
const { useState, useEffect, useRef } = React;

const BG = "#07080c";
const FG = "#e7e9ee";
const MUTED = "#8b91a3";
const BORDER = "#1f2433";
const SURFACE = "#0d1018";
const ACCENT = "#34d399";       // green — "verified" / live
const ACCENT_DARK = "#052e1d";
const VIOLET = "#a78bfa";       // purple — "committed" / onchain

const fontSans = "'Inter', ui-sans-serif, -apple-system, system-ui, sans-serif";
const fontMono = "'JetBrains Mono', ui-monospace, monospace";

// ─── The mark ────────────────────────────────────────────────────────────────
//
// Five circle nodes connected by a dashed line (the "live ledger"),
// each with a vertical trace down to a square node (the "onchain commit").
// Reads as: many memories → one merkle row → many commits.
//
function GraphMark({
  size = 140,
  topColor = ACCENT,
  bottomColor = VIOLET,
  lineColor,
  filled = true,         // squares filled vs. outlined
  count = 5,
  glow = false,
}) {
  const w = size;
  const h = size * 0.62;
  const pad = size * 0.08;
  const innerW = w - pad * 2;
  const xs = Array.from({ length: count }, (_, i) =>
    pad + (innerW * i) / (count - 1));
  const yTop = h * 0.20;
  const yBottom = h * 0.78;
  const r = size * 0.045;
  const sq = size * 0.085;
  const stroke = Math.max(1.2, size * 0.012);
  const lc = lineColor || `${topColor}aa`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none"
      style={{ display: "block",
        filter: glow ? `drop-shadow(0 0 ${size*0.05}px ${topColor}66)` : "none" }}>
      {/* Top dashed connector */}
      <line x1={xs[0]} y1={yTop} x2={xs[xs.length-1]} y2={yTop}
        stroke={lc} strokeWidth={stroke}
        strokeDasharray={`${stroke*2.4} ${stroke*1.8}`} strokeLinecap="round" />
      {/* Verticals + nodes */}
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={yTop} x2={x} y2={yBottom - sq/2}
            stroke={`${bottomColor}99`} strokeWidth={stroke*0.8}
            strokeDasharray={`${stroke*1.4} ${stroke*1.4}`} strokeLinecap="round" />
          <circle cx={x} cy={yTop} r={r} fill={topColor} />
          <rect x={x - sq/2} y={yBottom - sq} width={sq} height={sq}
            rx={size*0.005}
            fill={filled ? bottomColor : "none"}
            stroke={bottomColor} strokeWidth={stroke}
            strokeLinejoin="miter" />
        </g>
      ))}
    </svg>
  );
}

// Wordmark — light, even tracking. Inter at semibold reads well lowercase.
function Wordmark({ size = 56, color = FG, letterSpacing = "0.18em" }) {
  return (
    <span style={{
      fontFamily: fontSans, fontSize: size, fontWeight: 500,
      letterSpacing, color, lineHeight: 1, fontFeatureSettings: '"ss01"',
    }}>shingi</span>
  );
}

function Tagline({ size = 11, color }) {
  return (
    <span style={{
      fontFamily: fontMono, fontSize: size, fontWeight: 500,
      letterSpacing: "0.42em", textTransform: "uppercase", color: color || MUTED,
    }}>memory<span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>verified</span>
  );
}

// ─── Caption helper ─────────────────────────────────────────────────────────
const Caption = ({ children, color = MUTED }) => (
  <div style={{
    position: "absolute", left: 16, bottom: 14,
    fontFamily: fontMono, fontSize: 10, letterSpacing: "0.2em",
    textTransform: "uppercase", color,
  }}>{children}</div>
);

// ─── 01 · Primary lockup (dark) ─────────────────────────────────────────────
function LogoPrimary() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, color: FG,
      display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 }}>
        <GraphMark size={220} glow />
        <Wordmark size={64} />
        <Tagline size={12} />
      </div>
      <Caption>01 · primary lockup</Caption>
    </div>
  );
}

// ─── 02 · Horizontal lockup ─────────────────────────────────────────────────
function LogoHorizontal() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <GraphMark size={140} />
        <div style={{ height: 80, width: 1, background: BORDER }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Wordmark size={48} />
          <Tagline size={10} />
        </div>
      </div>
      <Caption>02 · horizontal lockup</Caption>
    </div>
  );
}

// ─── 03 · Inline (compact, for header) ──────────────────────────────────────
function LogoInline() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GraphMark size={76} />
        <Wordmark size={32} letterSpacing="0.14em" />
      </div>
      <Caption>03 · inline · for app header</Caption>
    </div>
  );
}

// ─── 04 · Mark only — favicon / app icon ────────────────────────────────────
function LogoMark() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{
        width: 200, height: 200, borderRadius: 36,
        background: `linear-gradient(160deg, ${SURFACE}, ${BG})`,
        border: `1px solid ${BORDER}`,
        display: "grid", placeItems: "center",
        boxShadow: `0 30px 60px -20px ${ACCENT}33, inset 0 1px 0 ${ACCENT}22`,
      }}>
        <GraphMark size={150} />
      </div>
      <Caption>04 · app icon · 200×200</Caption>
    </div>
  );
}

// ─── 05 · On light ─────────────────────────────────────────────────────────
function LogoOnLight() {
  const dark = "#0c0d10";
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "#f6f6f3", display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 }}>
        <GraphMark size={180}
          topColor="#0a7a52" bottomColor="#6d4ad9"
          lineColor="#0a7a5288" />
        <Wordmark size={56} color={dark} />
        <Tagline size={11} color="#6b7280" />
      </div>
      <Caption color="#6b7280">05 · on light</Caption>
    </div>
  );
}

// ─── 06 · Mono — single color, all green ───────────────────────────────────
function LogoMonoGreen() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 }}>
        <GraphMark size={180}
          topColor={ACCENT} bottomColor={ACCENT}
          lineColor={`${ACCENT}aa`} />
        <Wordmark size={56} color={ACCENT} />
        <Tagline size={11} color={`${ACCENT}99`} />
      </div>
      <Caption>06 · mono · accent</Caption>
    </div>
  );
}

// ─── 07 · Mono — white ────────────────────────────────────────────────────
function LogoMonoWhite() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 }}>
        <GraphMark size={180}
          topColor={FG} bottomColor={FG}
          lineColor={`${FG}aa`} filled={false} />
        <Wordmark size={56} color={FG} />
        <Tagline size={11} color={`${FG}99`} />
      </div>
      <Caption>07 · mono · white</Caption>
    </div>
  );
}

// ─── 08 · Stacked roundel (for stamps / stickers) ──────────────────────────
function LogoRoundel() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <path id="curve-top" d="M 30 110 a 80 80 0 0 1 160 0" fill="none" />
          <path id="curve-bot" d="M 30 110 a 80 80 0 0 0 160 0" fill="none" />
        </defs>
        <circle cx="110" cy="110" r="100" fill="none"
          stroke={VIOLET} strokeWidth="1.5" />
        <circle cx="110" cy="110" r="92" fill="none"
          stroke={VIOLET} strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
        <text fill={FG} fontFamily={fontMono} fontSize="11"
          letterSpacing="6" textAnchor="middle" fontWeight="500">
          <textPath href="#curve-top" startOffset="50%">SHINGI</textPath>
        </text>
        <text fill={MUTED} fontFamily={fontMono} fontSize="9"
          letterSpacing="6" textAnchor="middle" fontWeight="500">
          <textPath href="#curve-bot" startOffset="50%">MEMORY · VERIFIED</textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", inset: 0,
        display: "grid", placeItems: "center" }}>
        <GraphMark size={130} />
      </div>
      <Caption>08 · roundel · sticker</Caption>
    </div>
  );
}

// ─── 09 · Animated mark — pulse (live) ──────────────────────────────────────
function LogoAnimated() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 5), 700);
    return () => clearInterval(id);
  }, []);

  const w = 220, h = 138, pad = 18;
  const count = 5;
  const innerW = w - pad * 2;
  const xs = Array.from({ length: count }, (_, i) =>
    pad + (innerW * i) / (count - 1));
  const yTop = h * 0.20, yBottom = h * 0.78;
  const r = 10, sq = 18;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: BG, display: "grid", placeItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
          <line x1={xs[0]} y1={yTop} x2={xs[xs.length-1]} y2={yTop}
            stroke={`${ACCENT}aa`} strokeWidth="2"
            strokeDasharray="5 4" strokeLinecap="round" />
          {xs.map((x, i) => {
            const active = i === tick;
            return (
              <g key={i}>
                <line x1={x} y1={yTop} x2={x} y2={yBottom - sq/2}
                  stroke={active ? VIOLET : `${VIOLET}77`} strokeWidth="1.5"
                  strokeDasharray="3 3" />
                <circle cx={x} cy={yTop} r={r} fill={ACCENT}
                  style={{
                    filter: active ? `drop-shadow(0 0 8px ${ACCENT})` : "none",
                    transition: "filter 0.3s",
                  }} />
                <rect x={x - sq/2} y={yBottom - sq} width={sq} height={sq}
                  fill={VIOLET}
                  style={{
                    filter: active ? `drop-shadow(0 0 10px ${VIOLET})` : "none",
                    transform: active ? "scale(1.08)" : "scale(1)",
                    transformOrigin: `${x}px ${yBottom - sq/2}px`,
                    transition: "all 0.3s",
                  }} />
              </g>
            );
          })}
        </svg>
        <Wordmark size={48} />
        <Tagline />
      </div>
      <Caption>09 · animated · live commit</Caption>
    </div>
  );
}

Object.assign(window, {
  GraphMark, Wordmark, Tagline,
  LogoPrimary, LogoHorizontal, LogoInline, LogoMark,
  LogoOnLight, LogoMonoGreen, LogoMonoWhite,
  LogoRoundel, LogoAnimated,
  // re-export tokens
  BRAND: { BG, FG, MUTED, BORDER, SURFACE, ACCENT, ACCENT_DARK, VIOLET, fontSans, fontMono },
});
