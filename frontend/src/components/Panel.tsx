import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  /** Dim the panel and keep last-known content when its data is stale/offline. */
  stale?: boolean;
}

export default function Panel({ title, children, className, stale }: PanelProps) {
  return (
    <section
      className={`flex min-h-0 flex-col border border-border bg-surface transition-opacity ${stale ? "opacity-40" : ""} ${className ?? ""}`}
    >
      <header className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-accent">
          {title}
        </h2>
        <span className="text-xs text-muted">{stale ? "STALE" : "●"}</span>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3 text-sm text-fg">
        {children}
      </div>
    </section>
  );
}
