"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

// Server emits a heartbeat every 5s; treat the link as dead after ~2.4 missed.
const HEARTBEAT_TIMEOUT_MS = 12_000;
const FRESHNESS_TICK_MS = 2_000;

export default function LiveIndicator() {
  const status = useDashboardStore((s) => s.status);
  const lastHeartbeatAt = useDashboardStore((s) => s.lastHeartbeatAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), FRESHNESS_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const heartbeatFresh =
    lastHeartbeatAt !== null &&
    now - new Date(lastHeartbeatAt).getTime() < HEARTBEAT_TIMEOUT_MS;
  const live = status === "online" && heartbeatFresh;

  const label = live
    ? "ONLINE"
    : status === "reconnecting"
      ? "RECONNECTING"
      : status === "connecting"
        ? "CONNECTING"
        : "OFFLINE";
  const tone = live
    ? "text-accent"
    : status === "reconnecting" || status === "connecting"
      ? "text-accent-2"
      : "text-muted";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${tone}`}>
      <span className={live ? "animate-pulse" : ""}>●</span>
      {label}
    </span>
  );
}
