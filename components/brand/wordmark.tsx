interface WordmarkProps {
  size?: number;
  letterSpacing?: string;
  className?: string;
}

export function Wordmark({
  size = 16,
  letterSpacing = "0.16em",
  className = "",
}: WordmarkProps) {
  return (
    <span
      className={`font-sans text-(--foreground) ${className}`}
      style={{
        fontSize: size,
        fontWeight: 500,
        letterSpacing,
        lineHeight: 1,
      }}
    >
      shingi
    </span>
  );
}
