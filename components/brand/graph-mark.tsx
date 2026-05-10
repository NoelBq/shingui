interface GraphMarkProps {
  size?: number;
  topColor?: string;
  bottomColor?: string;
  lineColor?: string;
  count?: number;
  glow?: boolean;
  filled?: boolean;
  className?: string;
}

export function GraphMark({
  size = 76,
  topColor = "var(--accent)",
  bottomColor = "var(--accent-violet)",
  lineColor,
  count = 5,
  glow = false,
  filled = true,
  className,
}: GraphMarkProps) {
  const w = size;
  const h = size * 0.62;
  const pad = size * 0.08;
  const innerW = w - pad * 2;
  const xs = Array.from({ length: count }, (_, i) =>
    pad + (innerW * i) / (count - 1),
  );
  const yTop = h * 0.2;
  const yBottom = h * 0.78;
  const r = size * 0.045;
  const sq = size * 0.085;
  const stroke = Math.max(1.2, size * 0.012);
  const lc = lineColor ?? topColor;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className={className}
      style={{
        display: "block",
        filter: glow
          ? `drop-shadow(0 0 ${size * 0.06}px ${topColor})`
          : undefined,
      }}
      aria-hidden
    >
      <line
        x1={xs[0]}
        y1={yTop}
        x2={xs[xs.length - 1]}
        y2={yTop}
        stroke={lc}
        strokeOpacity={0.8}
        strokeWidth={stroke}
        strokeDasharray={`${stroke * 2.4} ${stroke * 1.8}`}
        strokeLinecap="round"
      />
      {xs.map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={yTop}
            x2={x}
            y2={yBottom - sq / 2}
            stroke={bottomColor}
            strokeOpacity={0.6}
            strokeWidth={stroke * 0.8}
            strokeDasharray={`${stroke * 1.4} ${stroke * 1.4}`}
            strokeLinecap="round"
          />
          <circle cx={x} cy={yTop} r={r} fill={topColor} />
          <rect
            x={x - sq / 2}
            y={yBottom - sq}
            width={sq}
            height={sq}
            rx={size * 0.005}
            fill={filled ? bottomColor : "none"}
            stroke={bottomColor}
            strokeWidth={stroke}
            strokeLinejoin="miter"
          />
        </g>
      ))}
    </svg>
  );
}
