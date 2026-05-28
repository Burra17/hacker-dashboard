"use client";

import { useMemo } from "react";
import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";
import {
  selectSystemLogLines,
  type SystemLogLine,
} from "@/components/panels/selectSystemLogLines";

// Cap the rendered tail so a long-running session stays light.
const MAX_VISIBLE_LINES = 100;

const LEVEL_TONE: Record<SystemLogLine["level"], string> = {
  debug: "text-muted",
  info: "text-fg",
  warning: "text-accent-2",
  error: "text-accent-2",
};

export default function SystemLogsPanel({ className }: { className?: string }) {
  const online = useDashboardStore((s) => s.status === "online");
  const events = useDashboardStore((s) => s.streams[DASHBOARD_CHANNELS.systemLogs]);
  const lines = useMemo(
    () => selectSystemLogLines(events).slice(-MAX_VISIBLE_LINES),
    [events],
  );

  return (
    <Panel title="system.logs" className={className} stale={!online}>
      {lines.length === 0 ? (
        <p className="text-muted">{"// inga loggar än"}</p>
      ) : (
        <ul className="space-y-0.5">
          {lines.map((line) => (
            <li key={line.key} className="whitespace-pre-wrap break-all">
              <span className="text-muted">
                {new Date(line.timestamp).toLocaleTimeString()}{" "}
              </span>
              <span className={LEVEL_TONE[line.level]}>
                {line.level.toUpperCase().padEnd(7)}
              </span>
              <span className="text-accent">{line.source}: </span>
              <span className="text-fg">{line.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
