interface DiffField {
  key: string;
  value: string;
  flagged?: boolean;
}

interface DiffCardProps {
  title: string;
  variant: "live" | "onchain";
  hash: string;
  hashLabel?: string;
  fields: DiffField[];
}

export function DiffCard({
  title,
  variant,
  hash,
  hashLabel,
  fields,
}: DiffCardProps) {
  const dotClass =
    variant === "live"
      ? "bg-(--danger) shadow-[0_0_10px_var(--danger)]"
      : "bg-(--accent-violet) shadow-[0_0_10px_var(--accent-violet)]";
  const flagBg =
    variant === "live" ? "bg-(--danger)/[0.10]" : "bg-(--accent-violet)/[0.10]";
  const flagText =
    variant === "live" ? "text-(--danger)" : "text-(--accent-violet)";
  const hashColor =
    variant === "live" ? "text-(--danger)" : "text-(--accent-violet)";

  return (
    <div className="rounded-[14px] border border-(--border) bg-(--surface) p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--muted)">
          {title}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${dotClass}`}
          aria-hidden
        />
      </div>
      <div className="rounded-[10px] border border-(--border) bg-(--background) p-3 font-mono text-xs leading-7">
        <div className="text-(--muted)">{"{"}</div>
        {fields.map((f) => (
          <div
            key={f.key}
            className={
              "px-3 " + (f.flagged ? `-mx-3 ${flagBg}` : "")
            }
          >
            <span className="text-sky-300">&quot;{f.key}&quot;</span>:{" "}
            <span
              className={f.flagged ? flagText : "text-(--accent)"}
            >
              {f.value}
            </span>
          </div>
        ))}
        <div className="text-(--muted)">{"}"}</div>
      </div>
      <div
        className={`mt-3 break-all font-mono text-[11px] ${hashColor}`}
      >
        {hash}
        {hashLabel ? (
          <span className="ml-2 text-(--muted)">{hashLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
