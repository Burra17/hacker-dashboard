"use client";

import type { SystemLogLevel } from "@contracts/SystemLogPayload";
import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";
import { selectSystemLogLines } from "@/components/panels/selectSystemLogLines";

// Cap the rendered list so the rolling feed stays light.
const MAX_VISIBLE_LINES = 100;

const LEVEL_STYLE: Record<SystemLogLevel, string> = {
  debug: "text-muted",
  info: "text-accent-2",
  warning: "text-warning",
  error: "text-error",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function SystemLogsPanel({ className }: { className?: string }) {
  const events = useDashboardStore((s) => s.streams[DASHBOARD_CHANNELS.systemLogs]);
  // Newest first, capped — mirrors the GitHub activity panel.
  const lines = selectSystemLogLines(events).slice(-MAX_VISIBLE_LINES).reverse();

  return (
    <Panel title="system logs" className={className}>
      {lines.length > 0 ? (
        <ul className="space-y-0.5">
          {lines.map((line) => (
            <li key={line.key} className="whitespace-pre-wrap break-words">
              <span className="text-muted">[{formatTime(line.timestamp)}] </span>
              <span className={`uppercase ${LEVEL_STYLE[line.level]}`}>{line.level} </span>
              <span className="text-accent">[{line.source}]</span>
              <span className="text-fg">: {line.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{"// inga loggar än"}</p>
      )}
    </Panel>
  );
}
