/* Shingi banners — graph mark, no kanji */

const BG = "#07080c";
const FG = "#e7e9ee";
const MUTED = "#8b91a3";
const BORDER = "#1f2433";
const SURFACE = "#0d1018";
const ACCENT = "#34d399";
const ACCENT_DARK = "#052e1d";
const VIOLET = "#a78bfa";

const fontSans = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fontMono = "'JetBrains Mono', ui-monospace, monospace";

// Big background graph — many nodes, low opacity
function BigGraphBg({ rows = 3, cols = 14, opacity = 0.15 }) {
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      items.push({ r, c, key: `${r}-${c}` });
    }
  }
  return (
    <svg viewBox="0 0 1400 600" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity }}>
      {/* dashed grid lines */}
      {[150, 300, 450].map(y => (
        <line key={y} x1="50" y1={y} x2="1350" y2={y}
          stroke={ACCENT} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      ))}
      {/* verticals + nodes */}
      {Array.from({ length: cols }, (_, c) => {
        const x = 60 + c * 95;
        return (
          <g key={c}>
            <line x1={x} y1="150" x2={x} y2="450"
              stroke={VIOLET} strokeWidth="0.8"
              strokeDasharray="2 3" opacity="0.4" />
            <circle cx={x} cy="150" r="6" fill={ACCENT} />
            <rect x={x - 6} y="295" width="12" height="12" fill={VIOLET} />
            <circle cx={x} cy="450" r="6" fill={ACCENT} />
          </g>
        );
      })}
    </svg>
  );
}

// Inline graph for use inside banners (5 nodes)
function MiniGraph({ size = 110, top = ACCENT, bot = VIOLET }) {
  const w = size, h = size * 0.62, pad = size * 0.08;
  const count = 5, innerW = w - pad * 2;
  const xs = Array.from({ length: count }, (_, i) =>
    pad + (innerW * i) / (count - 1));
  const yTop = h * 0.20, yBottom = h * 0.78;
  const r = size * 0.045, sq = size * 0.085;
  const stroke = Math.max(1.2, size * 0.012);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <line x1={xs[0]} y1={yTop} x2={xs[xs.length-1]} y2={yTop}
        stroke={`${top}cc`} strokeWidth={stroke}
        strokeDasharray={`${stroke*2.4} ${stroke*1.8}`} strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={yTop} x2={x} y2={yBottom - sq/2}
            stroke={`${bot}aa`} strokeWidth={stroke*0.8}
            strokeDasharray={`${stroke*1.4} ${stroke*1.4}`} strokeLinecap="round" />
          <circle cx={x} cy={yTop} r={r} fill={top} />
          <rect x={x - sq/2} y={yBottom - sq} width={sq} height={sq} fill={bot} />
        </g>
      ))}
    </svg>
  );
}

const HeroBg = () => (
  <>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
      maskImage: "radial-gradient(ellipse at 30% 50%, black 30%, transparent 75%)",
    }} />
    <div style={{
      position: "absolute", left: "-10%", top: "-30%",
      width: "60%", height: "120%",
      background: `radial-gradient(ellipse at center, ${ACCENT}24 0%, transparent 60%)`,
      filter: "blur(20px)",
    }} />
    <div style={{
      position: "absolute", right: "-10%", bottom: "-30%",
      width: "55%", height: "100%",
      background: `radial-gradient(ellipse at center, ${VIOLET}1c 0%, transparent 60%)`,
      filter: "blur(30px)",
    }} />
  </>
);

// ─── Banner 1 · GitHub README hero (1280×640) ───────────────────────────────
function BannerGitHub() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      color: FG, overflow: "hidden", background: BG,
    }}>
      <HeroBg />
      <div style={{
        position: "absolute", right: 60, top: "50%",
        transform: "translateY(-50%)", opacity: 0.55,
      }}>
        <MiniGraph size={520} />
      </div>
      <div style={{
        position: "relative", padding: "72px 80px",
        height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <MiniGraph size={64} />
            <span style={{
              fontFamily: fontSans, fontSize: 26, fontWeight: 500,
              letterSpacing: "0.16em",
            }}>shingi</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 999,
            border: `1px solid ${BORDER}`, background: SURFACE + "aa",
            fontFamily: fontMono, fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: ACCENT }} />
            solana · devnet
          </div>
        </div>

        <div style={{ maxWidth: 720 }}>
          <div style={{
            fontFamily: fontMono, fontSize: 12,
            letterSpacing: "0.36em", textTransform: "uppercase", color: ACCENT,
            marginBottom: 18,
          }}>memory · verified</div>
          <h1 style={{
            fontFamily: fontSans, fontSize: 72, lineHeight: 1.02, fontWeight: 600,
            letterSpacing: "-0.035em", margin: 0,
          }}>
            Tamper-proof memory<br />
            for <span style={{ color: ACCENT }}>autonomous AI agents</span>.
          </h1>
        </div>

        <div style={{
          fontFamily: fontMono, fontSize: 10,
          letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED,
        }}>shingi.dev · github.com/shingi · MIT</div>
      </div>
    </div>
  );
}

// ─── Banner 2 · X / Twitter header (1500×500) ───────────────────────────────
function BannerTwitter() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      color: FG, overflow: "hidden", background: BG,
    }}>
      <HeroBg />
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        padding: "0 100px",
      }}>
        <MiniGraph size={620} />
      </div>
      <div style={{
        position: "relative", padding: "80px",
        height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", maxWidth: 760,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <MiniGraph size={56} />
          <span style={{
            fontFamily: fontSans, fontSize: 22, fontWeight: 500,
            letterSpacing: "0.18em",
          }}>shingi</span>
        </div>
        <h1 style={{
          fontFamily: fontSans, fontSize: 64, lineHeight: 1.05, fontWeight: 600,
          letterSpacing: "-0.03em", margin: 0,
        }}>
          A trust layer<br />for <span style={{ color: ACCENT }}>AI memories</span>.
        </h1>
        <p style={{
          margin: "18px 0 0 0", fontSize: 18, color: MUTED, lineHeight: 1.5,
          maxWidth: 520,
        }}>
          Fast in Postgres. <span style={{ color: VIOLET }}>Verifiable</span> on Solana.
        </p>
      </div>
    </div>
  );
}

// ─── Banner 3 · OG card (1200×630) ──────────────────────────────────────────
function BannerOG() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      color: FG, overflow: "hidden", background: BG,
    }}>
      <HeroBg />
      <div style={{
        position: "relative", padding: "80px 72px",
        height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MiniGraph size={60} />
          <span style={{
            fontFamily: fontSans, fontSize: 24, fontWeight: 500,
            letterSpacing: "0.18em",
          }}>shingi</span>
        </div>
        <div>
          <h1 style={{
            fontFamily: fontSans, fontSize: 78, lineHeight: 0.98, fontWeight: 600,
            letterSpacing: "-0.04em", margin: 0,
          }}>
            Verifiable memory<br />for <span style={{ color: ACCENT }}>AI agents.</span>
          </h1>
          <p style={{
            margin: "22px 0 0 0", fontSize: 22, color: MUTED, lineHeight: 1.4,
          }}>
            Hash-anchored to Solana. Tamper-evident by design.
          </p>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: fontMono, fontSize: 12,
          letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED,
        }}>
          <span>memory · verified</span>
          <span>shingi.dev</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BannerGitHub, BannerTwitter, BannerOG, MiniGraph });
