"use client";

import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";

export default function SystemLogsPanel({ className }: { className?: string }) {
  const online = useDashboardStore((s) => s.status === "online");

  return (
    <Panel title="system.logs" className={className} stale={!online}>
      <p className="text-muted">{"// väntar på stream — kopplas i Fas 3"}</p>
    </Panel>
  );
}
