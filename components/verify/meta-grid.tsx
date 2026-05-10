interface MetaItem {
  label: string;
  value: string;
  href?: string;
}

interface MetaGridProps {
  items: MetaItem[];
}

export function MetaGrid({ items }: MetaGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[12px] border border-(--border) bg-(--surface) p-3.5"
        >
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-(--muted)">
            {item.label}
          </div>
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-sm font-medium text-(--foreground) transition-colors hover:text-(--accent)"
            >
              {item.value}
            </a>
          ) : (
            <div className="break-all text-sm font-medium text-(--foreground)">
              {item.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
