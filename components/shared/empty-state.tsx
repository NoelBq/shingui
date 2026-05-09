import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface)/40 p-10 text-center">
      <h3 className="text-base font-semibold text-(--foreground)">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-(--muted)">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
