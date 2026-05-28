"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DASHBOARD_CHANNELS } from "@/lib/signalr/channels";
import { selectSystemLogLines } from "@/components/panels/selectSystemLogLines";

const SCROLL_DURATION_S = 30;
const MAX_ITEMS = 20;
// Refresh the marquee content on a slow cadence so the scroll stays smooth
// instead of restarting every time a delta arrives (~1-2s).
const REFRESH_MS = 5_000;

function buildItems(): string[] {
  const events =
    useDashboardStore.getState().streams[DASHBOARD_CHANNELS.systemLogs];
  return selectSystemLogLines(events)
    .slice(-MAX_ITEMS)
    .map((line) => `${line.source}: ${line.message}`);
}

export default function Ticker() {
  const [items, setItems] = useState<string[]>(buildItems);

  useEffect(() => {
    const id = setInterval(() => setItems(buildItems()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) {
    return <span className="text-muted">{"// inga strömdata än"}</span>;
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: SCROLL_DURATION_S }}
      >
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {items.map((item, index) => (
              <span key={index} className="px-6 tracking-widest text-muted">
                <span className="text-accent">▸</span> {item}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
