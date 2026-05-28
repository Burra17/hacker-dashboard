"use client";

import { useEffect, useMemo, useRef } from "react";
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function SystemLogsPanel({ className }: { className?: string }) {
  const online = useDashboardStore((s) => s.status === "online");
  const events = useDashboardStore((s) => s.streams[DASHBOARD_CHANNELS.systemLogs]);
  const lines = useMemo(
    () => selectSystemLogLines(events).slice(-MAX_VISIBLE_LINES),
    [events],
  );

  const bottomRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <Panel title="system.logs" className={className} stale={!online}>
      {lines.length === 0 ? (
        <p className="text-muted">{"// inga loggar än"}</p>
      ) : (
        <ul className="space-y-0.5">
          {lines.map((line) => (
            <li key={line.key} className="whitespace-pre-wrap break-words">
              <span className="text-muted">{formatTime(line.timestamp)} </span>
              <span className={`inline-block w-[8ch] ${LEVEL_TONE[line.level]}`}>
                {line.level.toUpperCase()}
              </span>
              <span className="text-accent">{line.source}: </span>
              <span className="text-fg">{line.message}</span>
            </li>
          ))}
          <li ref={bottomRef} aria-hidden="true" />
        </ul>
      )}
    </Panel>
  );
}
