"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import AsciiProgressBar from "@/components/boot/AsciiProgressBar";
import HudSpinner from "@/components/boot/HudSpinner";
import ScrambleText from "@/components/boot/ScrambleText";
import { useBootReady, type BootTask } from "@/lib/boot/useBootReady";

/** Hold the animation at least this long so the effect always lands. */
const MIN_BOOT_MS = 2500;
/** Hard cap so a dead upstream can never hang the boot. */
const MAX_BOOT_MS = 8000;
/** Linger on the all-green checklist so you actually see every task resolve. */
const GREEN_HOLD_MS = 1100;
/** How long "ALL SYSTEMS ONLINE" shows before the reveal. */
const FINISH_HOLD_MS = 1100;
/** Duration of the fade-out reveal, in seconds. */
const REVEAL_DURATION_S = 1.1;
const FINAL_MESSAGE = "ALL SYSTEMS ONLINE";

function statusGlyph(task: BootTask): string {
  if (task.failed) return "✗";
  if (task.done) return "✓";
  return "▸";
}

function statusToneClass(task: BootTask): string {
  if (task.failed) return "text-error";
  if (task.done) return "text-accent";
  return "text-muted";
}

/**
 * Full-screen HUD boot overlay (Issue 7.1). Covers the dashboard until the initial
 * feeds have settled and the uplink is online, then prints "ALL SYSTEMS ONLINE" and
 * fades out to reveal the (already-populated) grid. Mounted in `page.tsx` above the
 * grid so its query hooks resolve inside the QueryProvider.
 */
export default function BootSequence() {
  const { tasks, ready, progress } = useBootReady();
  const reduceMotion = useReducedMotion();
  const [minElapsed, setMinElapsed] = useState(false);
  const [maxReached, setMaxReached] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), MIN_BOOT_MS);
    const maxTimer = setTimeout(() => setMaxReached(true), MAX_BOOT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  const ableToComplete = minElapsed && (ready || maxReached);
  const phase = done ? "done" : finishing ? "finishing" : "booting";

  // Linger on the green checklist a beat before swapping to the final message.
  useEffect(() => {
    if (!ableToComplete || finishing) return;
    const timer = setTimeout(() => setFinishing(true), GREEN_HOLD_MS);
    return () => clearTimeout(timer);
  }, [ableToComplete, finishing]);

  // Hold "ALL SYSTEMS ONLINE" a beat, then reveal the dashboard.
  useEffect(() => {
    if (!finishing || done) return;
    const timer = setTimeout(() => setDone(true), FINISH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [finishing, done]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="boot"
          role="status"
          aria-busy
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden bg-bg"
          initial={{ opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.04, filter: "blur(4px)" }
          }
          transition={{
            duration: reduceMotion ? 0.2 : REVEAL_DURATION_S,
            ease: "easeInOut",
          }}
        >
          {!reduceMotion && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/40"
              style={{ animation: "boot-scan 4s linear infinite" }}
            />
          )}

          <HudSpinner className="h-28 w-28" />

          <div className="w-[min(90vw,32rem)] font-mono text-sm">
            {phase === "booting" ? (
              <ul className="flex flex-col gap-1">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    <span className={statusToneClass(task)}>
                      {statusGlyph(task)}
                    </span>
                    <ScrambleText
                      text={task.label}
                      className="tracking-widest text-fg"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ScrambleText
                text={FINAL_MESSAGE}
                className="block text-center text-lg tracking-[0.3em] text-accent"
              />
            )}

            <div className="mt-6 text-center">
              <AsciiProgressBar progress={finishing ? 1 : progress} />
            </div>
          </div>

          <span className="sr-only" aria-live="polite">
            {finishing ? "All systems online" : "System booting"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
