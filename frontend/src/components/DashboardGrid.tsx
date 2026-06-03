"use client";

import { useState, type PointerEvent } from "react";
import TickerPanel from "@/components/panels/TickerPanel";
import GithubActivityPanel from "@/components/panels/GithubActivityPanel";
import SystemLogsPanel from "@/components/panels/SystemLogsPanel";
import SportsPanel from "@/components/panels/SportsPanel";
import TerminalPanel from "@/components/panels/TerminalPanel";
import { useDashboardStore } from "@/store/useDashboardStore";

const DEFAULT_TERMINAL_HEIGHT = 180;
const MIN_TERMINAL_HEIGHT = 80;
// Keep enough room for the rows above the terminal.
const MIN_SPACE_ABOVE = 220;

export default function DashboardGrid() {
  const [terminalHeight, setTerminalHeight] = useState(DEFAULT_TERMINAL_HEIGHT);
  const panels = useDashboardStore((s) => s.panels);

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = terminalHeight;

    const onMove = (move: globalThis.PointerEvent) => {
      const max = window.innerHeight - MIN_SPACE_ABOVE;
      const next = startHeight + (startY - move.clientY);
      setTerminalHeight(Math.min(Math.max(next, MIN_TERMINAL_HEIGHT), max));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <main
      className="grid h-screen grid-cols-2 bg-bg"
      style={{ gridTemplateRows: `auto 1fr 1fr ${terminalHeight}px` }}
    >
      {panels.ticker && (
        <TickerPanel className="col-span-2" showWeather={panels.weather} />
      )}
      {panels.logs && <SystemLogsPanel className="row-span-2" />}
      <div className="row-span-2 flex h-full min-h-0 flex-col">
        {panels.commits && <GithubActivityPanel className="min-h-0 flex-1" />}
        {panels.sports && <SportsPanel className="min-h-0 flex-1" />}
      </div>
      {panels.terminal && (
        <div className="col-span-2 flex min-h-0 flex-col">
          <div
            onPointerDown={startResize}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize terminal"
            className="h-1.5 shrink-0 cursor-ns-resize bg-border transition-colors hover:bg-accent"
          />
          <TerminalPanel className="min-h-0 flex-1" />
        </div>
      )}
    </main>
  );
}
