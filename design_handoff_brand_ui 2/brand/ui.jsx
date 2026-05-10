/* Shingi UI improvements — refreshed hero, memory list, verify status (no kanji) */

const BG = "#07080c";
const FG = "#e7e9ee";
const MUTED = "#8b91a3";
const BORDER = "#1f2433";
const SURFACE = "#0d1018";
const SURFACE_2 = "#131826";
const ACCENT = "#34d399";
const ACCENT_DARK = "#052e1d";
const VIOLET = "#a78bfa";
const DANGER = "#f87171";

const fontSans = "'Inter', ui-sans-serif, -apple-system, system-ui, sans-serif";
const fontMono = "'JetBrains Mono', ui-monospace, monospace";

// Inline graph mark
function GMark({ size = 36, top = ACCENT, bot = VIOLET }) {
  const w = size, h = size * 0.62, pad = size * 0.08;
  const count = 5, innerW = w - pad * 2;
  const xs = Array.from({ length: count }, (_, i) =>
    pad + (innerW * i) / (count - 1));
  const yTop = h * 0.20, yBottom = h * 0.78;
  const r = size * 0.045, sq = size * 0.085;
  const stroke = Math.max(1, size * 0.012);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none"
      style={{ display: "block" }}>
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

// Site header
const Header = () => (
  <div style={{
    height: 60, borderBottom: `1px solid ${BORDER}`,
    background: `${BG}d9`, backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 32px", flexShrink: 0,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GMark size={42} />
        <span style={{ fontFamily: fontSans, fontSize: 16, fontWeight: 500,
          letterSpacing: "0.16em", color: FG }}>shingi</span>
      </div>
      <nav style={{ display: "flex", gap: 24 }}>
        {["Memories", "Agents", "Docs"].map(l => (
          <span key={l} style={{ fontFamily: fontSans, fontSize: 13,
            color: MUTED }}>{l}</span>
        ))}
      </nav>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px", borderRadius: 99,
        border: `1px solid ${BORDER}`, fontFamily: fontMono, fontSize: 10,
        letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: ACCENT }} />
        devnet
      </span>
      <button style={{
        fontFamily: fontSans, fontSize: 13, fontWeight: 500,
        padding: "7px 14px", borderRadius: 8,
        border: `1px solid ${BORDER}`, background: SURFACE, color: FG,
      }}>Connect wallet</button>
    </div>
  </div>
);

const Grid = () => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)`,
    backgroundSize: "32px 32px",
    maskImage: "radial-gradient(ellipse at 30% 30%, black 25%, transparent 80%)",
  }} />
);

// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroRefreshed() {
  return (
    <div style={{
      width: "100%", height: "100%", background: BG, color: FG,
      display: "flex", flexDirection: "column", overflow: "hidden",
      position: "relative",
    }}>
      <Header />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <Grid />
        <div style={{
          position: "absolute", left: "-10%", top: "-20%",
          width: "55%", height: "100%",
          background: `radial-gradient(ellipse at center, ${ACCENT}1f 0%, transparent 60%)`,
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", right: "-5%", bottom: "-30%",
          width: "50%", height: "100%",
          background: `radial-gradient(ellipse at center, ${VIOLET}1c 0%, transparent 60%)`,
          filter: "blur(40px)",
        }} />

        <div style={{
          position: "relative", display: "grid",
          gridTemplateColumns: "1.05fr 1fr", gap: 64,
          maxWidth: 1280, margin: "0 auto",
          padding: "72px 64px",
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 12px", borderRadius: 99,
              border: `1px solid ${BORDER}`, background: `${SURFACE}aa`,
              fontFamily: fontMono, fontSize: 10,
              letterSpacing: "0.28em", textTransform: "uppercase", color: MUTED,
              marginBottom: 28,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 99,
                background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
              memory · verified · onchain
            </div>
            <h1 style={{
              fontFamily: fontSans, fontSize: 68, lineHeight: 1.02,
              fontWeight: 600, letterSpacing: "-0.035em", margin: 0,
            }}>
              Tamper-proof<br />memory for{" "}
              <span style={{ color: ACCENT }}>autonomous AI agents</span>.
            </h1>
            <p style={{
              fontFamily: fontSans, fontSize: 17, lineHeight: 1.55,
              color: MUTED, maxWidth: 520, marginTop: 22,
            }}>
              Every thought, observation, and decision an agent records gets
              hash-anchored to Solana. Anyone can verify the log hasn&apos;t been
              edited since it was committed.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
              <button style={{
                fontFamily: fontSans, fontSize: 14, fontWeight: 600,
                padding: "12px 22px", borderRadius: 99,
                background: ACCENT, color: ACCENT_DARK, border: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>Browse memories →</button>
              <button style={{
                fontFamily: fontSans, fontSize: 14, fontWeight: 500,
                padding: "12px 22px", borderRadius: 99,
                background: "transparent", color: FG,
                border: `1px solid ${BORDER}`,
              }}>Read the spec</button>
            </div>

            <div style={{
              marginTop: 48, display: "flex", alignItems: "center", gap: 24,
              fontFamily: fontMono, fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED,
            }}>
              <span>BUILT ON</span>
              <span style={{ color: FG, letterSpacing: "0.04em",
                fontFamily: fontSans, fontSize: 14, fontWeight: 500 }}>solana</span>
              <span style={{ width: 1, height: 14, background: BORDER }} />
              <span style={{ color: FG, letterSpacing: "0.04em",
                fontFamily: fontSans, fontSize: 14, fontWeight: 500 }}>anchor</span>
              <span style={{ width: 1, height: 14, background: BORDER }} />
              <span style={{ color: FG, letterSpacing: "0.04em",
                fontFamily: fontSans, fontSize: 14, fontWeight: 500 }}>supabase</span>
            </div>
          </div>

          <VerificationCard />
        </div>
      </div>
    </div>
  );
}

function VerificationCard() {
  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      <div style={{
        width: "100%", maxWidth: 460,
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 18, padding: 24,
        boxShadow: `0 30px 80px -20px ${ACCENT}1f, 0 0 0 1px ${ACCENT}22`,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 18,
        }}>
          <div style={{
            fontFamily: fontMono, fontSize: 10,
            letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED,
          }}>memory event · #4892</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${ACCENT}1a`, color: ACCENT,
            padding: "4px 10px", borderRadius: 99,
            fontFamily: fontMono, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, background: ACCENT,
              borderRadius: 99, boxShadow: `0 0 10px ${ACCENT}` }} />
            verified
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          paddingBottom: 16, borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${VIOLET}22`, display: "grid", placeItems: "center",
            fontFamily: fontMono, fontSize: 12, color: VIOLET, fontWeight: 700,
          }}>K</div>
          <div>
            <div style={{ fontFamily: fontSans, fontSize: 13,
              fontWeight: 600, color: FG }}>kage-trader</div>
            <div style={{ fontFamily: fontMono, fontSize: 10,
              color: MUTED, letterSpacing: "0.06em" }}>2026-05-09 · 14:32:08 UTC</div>
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: 14, borderRadius: 10,
          background: BG, border: `1px solid ${BORDER}`,
          fontFamily: fontMono, fontSize: 12, lineHeight: 1.7,
        }}>
          <div style={{ color: MUTED }}>{`{`}</div>
          <div style={{ paddingLeft: 14 }}>
            <span style={{ color: "#a7c5f5" }}>"thought"</span>:{" "}
            <span style={{ color: ACCENT }}>"SOL holding 165 — adding"</span>,
          </div>
          <div style={{ paddingLeft: 14 }}>
            <span style={{ color: "#a7c5f5" }}>"confidence"</span>:{" "}
            <span style={{ color: ACCENT }}>0.62</span>
          </div>
          <div style={{ color: MUTED }}>{`}`}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{
            fontFamily: fontMono, fontSize: 9,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: MUTED, marginBottom: 6,
          }}>recomputed sha-256</div>
          <div style={{
            fontFamily: fontMono, fontSize: 12, color: ACCENT,
            wordBreak: "break-all",
          }}>0x4f9b2c1a8e0d44b7c3a6f2…d7e8a1f0c3</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, margin: "10px 0",
          }}>
            <div style={{ flex: 1, borderTop: `1px dashed ${BORDER}` }} />
            <span style={{ fontFamily: fontMono, fontSize: 9,
              color: ACCENT, letterSpacing: "0.2em" }}>= MATCH ✓</span>
            <div style={{ flex: 1, borderTop: `1px dashed ${BORDER}` }} />
          </div>
          <div style={{
            fontFamily: fontMono, fontSize: 9,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: MUTED, marginBottom: 6,
          }}>onchain commit · slot 358,192,044</div>
          <div style={{
            fontFamily: fontMono, fontSize: 12, color: VIOLET,
            wordBreak: "break-all",
          }}>0x4f9b2c1a8e0d44b7c3a6f2…d7e8a1f0c3</div>
        </div>

        <div style={{
          marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: fontMono, fontSize: 10,
            letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
            tx: 5kqv…3hp7
          </span>
          <span style={{
            fontFamily: fontSans, fontSize: 12, fontWeight: 600,
            color: ACCENT,
          }}>view on solscan ↗</span>
        </div>
      </div>
    </div>
  );
}

// ─── Memory list ────────────────────────────────────────────────────────────
const SAMPLE_MEMS = [
  { agent: "kage-trader", time: "14:32:08", thought: "SOL holding 165 support — adding to the position", conf: 0.62, hash: "4f9b2c…d7e8a1", status: "ok" },
  { agent: "neko-arb", time: "14:28:51", thought: "Cross-DEX spread on JTO collapsed; closing arb", conf: 0.81, hash: "8c1a02…42b9f0", status: "ok" },
  { agent: "kage-trader", time: "14:21:14", thought: "Volatility regime flip detected; reducing leverage 2x→1x", conf: 0.74, hash: "1d4e88…0f3c7e", status: "ok" },
  { agent: "kitsune-mm", time: "14:18:02", thought: "Quote skew widened on JUP; pulling bids", conf: 0.55, hash: "ab2710…9c1e44", status: "tampered" },
  { agent: "neko-arb", time: "14:11:39", thought: "Funding rate divergence on PERP-SOL; opening basis trade", conf: 0.69, hash: "30e7c2…81dd0a", status: "ok" },
  { agent: "kage-trader", time: "14:04:22", thought: "Rejected entry — risk model flagged correlated drawdown", conf: 0.40, hash: "7b9143…ee2f55", status: "ok" },
];

function MemoryList() {
  return (
    <div style={{
      width: "100%", height: "100%", background: BG, color: FG,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <Header />
      <div style={{ flex: 1, padding: "40px 64px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <div style={{
                fontFamily: fontMono, fontSize: 10,
                letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT,
                marginBottom: 8,
              }}>live ledger</div>
              <h2 style={{ fontFamily: fontSans, fontSize: 36, fontWeight: 600,
                letterSpacing: "-0.025em", margin: 0 }}>Recent memories</h2>
              <p style={{ fontFamily: fontSans, fontSize: 14, color: MUTED,
                margin: "6px 0 0 0" }}>
                Live from Postgres. Every row is recomputed against its onchain commit on click.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["All agents", "kage-trader", "neko-arb", "kitsune-mm"].map((l, i) => (
                <span key={l} style={{
                  fontFamily: fontMono, fontSize: 11,
                  padding: "6px 12px", borderRadius: 99,
                  border: `1px solid ${i === 0 ? ACCENT + "55" : BORDER}`,
                  color: i === 0 ? ACCENT : MUTED,
                  background: i === 0 ? `${ACCENT}10` : "transparent",
                  letterSpacing: "0.04em",
                }}>{l}</span>
              ))}
            </div>
          </div>

          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 14,
            background: SURFACE, overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "140px 70px 1fr 110px 200px 90px",
              padding: "12px 18px", gap: 16,
              fontFamily: fontMono, fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span>agent</span>
              <span>time</span>
              <span>thought</span>
              <span>conf</span>
              <span>hash</span>
              <span style={{ textAlign: "right" }}>status</span>
            </div>
            {SAMPLE_MEMS.map((m, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "140px 70px 1fr 110px 200px 90px",
                padding: "14px 18px", gap: 16, alignItems: "center",
                borderBottom: i < SAMPLE_MEMS.length - 1 ? `1px solid ${BORDER}` : "none",
                background: i === 0 ? `${ACCENT}06` : "transparent",
              }}>
                <span style={{ fontFamily: fontSans, fontSize: 13, fontWeight: 600,
                  color: FG }}>{m.agent}</span>
                <span style={{ fontFamily: fontMono, fontSize: 11, color: MUTED }}>{m.time}</span>
                <span style={{ fontFamily: fontSans, fontSize: 13, color: FG,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  "{m.thought}"
                </span>
                <ConfBar v={m.conf} />
                <span style={{ fontFamily: fontMono, fontSize: 11,
                  color: m.status === "ok" ? VIOLET : DANGER,
                  letterSpacing: "0.04em" }}>0x{m.hash}</span>
                <span style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 9px", borderRadius: 99,
                    fontFamily: fontMono, fontSize: 9, fontWeight: 600,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    background: m.status === "ok" ? `${ACCENT}1a` : `${DANGER}1a`,
                    color: m.status === "ok" ? ACCENT : DANGER,
                  }}>
                    {m.status === "ok" ? "✓ ok" : "✕ tamper"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfBar({ v }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 4, background: BORDER, borderRadius: 99,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${v * 100}%`, height: "100%", background: ACCENT,
        }} />
      </div>
      <span style={{ fontFamily: fontMono, fontSize: 11, color: MUTED }}>
        {v.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Verify page ────────────────────────────────────────────────────────────
function VerifyPage() {
  return (
    <div style={{
      width: "100%", height: "100%", background: BG, color: FG,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <Header />
      <div style={{ flex: 1, padding: "40px 64px",
        position: "relative" }}>
        <Grid />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{
            fontFamily: fontMono, fontSize: 11,
            letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED,
            marginBottom: 16,
          }}>← memories / verify · #4892</div>

          <div style={{
            border: `1px solid ${DANGER}55`, borderRadius: 16,
            background: `linear-gradient(180deg, ${DANGER}1a, ${DANGER}06)`,
            padding: 24, marginBottom: 28, position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${DANGER}22`, border: `1px solid ${DANGER}55`,
                  display: "grid", placeItems: "center",
                  fontSize: 22,
                }}>✕</div>
                <div>
                  <div style={{ fontFamily: fontMono, fontSize: 11,
                    letterSpacing: "0.28em", textTransform: "uppercase",
                    color: DANGER, marginBottom: 4 }}>tampered · hash mismatch</div>
                  <div style={{ fontFamily: fontSans, fontSize: 22,
                    fontWeight: 600, letterSpacing: "-0.02em" }}>
                    Payload changed after onchain commit.
                  </div>
                </div>
              </div>
              {/* Tampered node graphic */}
              <svg width="180" height="60" viewBox="0 0 180 60">
                {[20, 55, 90, 125, 160].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy={14} r="5" fill={ACCENT} />
                    <line x1={x} y1={14} x2={x} y2={i === 3 ? 38 : 42}
                      stroke={i === 3 ? DANGER : `${VIOLET}aa`} strokeWidth="1.2"
                      strokeDasharray={i === 3 ? "2 2" : "3 3"} />
                    <rect x={x - 6} y={i === 3 ? 38 : 42} width="12" height="12"
                      fill={i === 3 ? DANGER : VIOLET}
                      transform={i === 3 ? `rotate(8 ${x} 48)` : undefined} />
                  </g>
                ))}
                <line x1="20" y1="14" x2="160" y2="14" stroke={`${ACCENT}cc`}
                  strokeWidth="1.2" strokeDasharray="4 3" />
              </svg>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <DiffCard title="Recomputed (live payload)"
              hash="0x9a1f3e22ce0…  (mismatch)" color={DANGER}
              rows={[
                { k: "thought", v: '"SOL holding 165 — adding"', flag: false },
                { k: "confidence", v: "0.95", flag: true },
              ]} />
            <DiffCard title="Onchain commit" hash="0x4f9b2c1a8e0…d7e8a1f0c3"
              color={VIOLET}
              rows={[
                { k: "thought", v: '"SOL holding 165 — adding"', flag: false },
                { k: "confidence", v: "0.62", flag: true },
              ]} />
          </div>

          <div style={{
            marginTop: 24,
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
          }}>
            {[
              ["Agent", "kage-trader"],
              ["Slot", "358,192,044"],
              ["Block time", "2026-05-09 14:32:08 UTC"],
              ["Tx", "5KqV…3Hp7 ↗"],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: 14,
              }}>
                <div style={{
                  fontFamily: fontMono, fontSize: 9,
                  letterSpacing: "0.22em", textTransform: "uppercase", color: MUTED,
                  marginBottom: 6,
                }}>{k}</div>
                <div style={{ fontFamily: fontSans, fontSize: 14,
                  color: FG, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffCard({ title, hash, color, rows }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      borderRadius: 14, padding: 18,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: fontMono, fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>{title}</span>
        <span style={{
          width: 8, height: 8, borderRadius: 99, background: color,
          boxShadow: `0 0 10px ${color}`,
        }} />
      </div>
      <div style={{
        background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: 12, fontFamily: fontMono, fontSize: 12, lineHeight: 1.7,
      }}>
        <div style={{ color: MUTED }}>{`{`}</div>
        {rows.map(r => (
          <div key={r.k} style={{
            paddingLeft: 12, paddingRight: 12,
            background: r.flag ? `${color}15` : "transparent",
            margin: r.flag ? "0 -12px" : 0,
          }}>
            <span style={{ color: "#a7c5f5" }}>"{r.k}"</span>:{" "}
            <span style={{ color: r.flag ? color : ACCENT }}>{r.v}</span>
          </div>
        ))}
        <div style={{ color: MUTED }}>{`}`}</div>
      </div>
      <div style={{
        marginTop: 12, fontFamily: fontMono, fontSize: 11, color,
        wordBreak: "break-all",
      }}>{hash}</div>
    </div>
  );
}

Object.assign(window, { HeroRefreshed, MemoryList, VerifyPage, GMark });
