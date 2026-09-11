import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-10",
        className,
      )}
    >
      <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {action}
    </div>
  );
}
