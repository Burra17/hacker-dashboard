"use client";

import { motion } from "framer-motion";
import { useSportsQuery } from "@/lib/api/sports";

const SCROLL_DURATION_S = 30;

export default function Ticker() {
  const { data, isError, isPending } = useSportsQuery();
  // Keep the last-known results but dim them when the upstream is stale/offline.
  const stale = isError || (data?.stale ?? false);

  if (!data) {
    return (
      <span className="text-muted">
        {isPending ? "// hämtar sport…" : "// sport otillgängligt"}
      </span>
    );
  }

  const items = [data.hammarby.latestResult, data.chelsea.latestResult];

  return (
    <div
      className={`relative min-w-0 flex-1 overflow-hidden transition-opacity ${stale ? "opacity-40" : ""}`}
    >
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
