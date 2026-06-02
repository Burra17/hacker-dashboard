"use client";

import Panel from "@/components/Panel";
import { useGithubActivityQuery } from "@/lib/api/github";

// Cap the rendered list so a busy feed stays light.
const MAX_VISIBLE_LINES = 100;

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function CommitsPanel({ className }: { className?: string }) {
  const { data, isError, isPending } = useGithubActivityQuery();
  const lines = (data ?? []).slice(0, MAX_VISIBLE_LINES);

  return (
    <Panel title="commits" className={className} stale={isError}>
      {lines.length > 0 ? (
        <ul className="space-y-0.5">
          {lines.map((line) => (
            <li key={line.key} className="whitespace-pre-wrap break-words">
              <span className="text-muted">[{formatTime(line.timestamp)}] </span>
              <span className="text-accent">INFO </span>
              <span className="text-accent">[{line.repo}]</span>
              <span className="text-fg">: {line.message}</span>
            </li>
          ))}
        </ul>
      ) : isPending ? (
        <p className="text-muted">{"// hämtar commits…"}</p>
      ) : isError ? (
        <p className="text-muted">{"// commits otillgängliga"}</p>
      ) : (
        <p className="text-muted">{"// inga commits än"}</p>
      )}
    </Panel>
  );
}
