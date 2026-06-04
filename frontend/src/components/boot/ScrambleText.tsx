"use client";

import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#%&$@";
const TICK_MS = 40;
const DEFAULT_DURATION_MS = 700;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function randomGlyph(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

interface ScrambleTextProps {
  /** Final, decrypted text. */
  text: string;
  /** How long the scramble-in takes before snapping to `text`. */
  durationMs?: number;
  className?: string;
}

/**
 * Decrypts `&%$#` noise into `text` left-to-right (the boot "decoding" effect).
 * Reduced-motion users start fully decoded. The displayed glyphs are random, so
 * the span suppresses hydration warnings rather than forcing a deterministic SSR.
 */
export default function ScrambleText({
  text,
  durationMs = DEFAULT_DURATION_MS,
  className,
}: ScrambleTextProps) {
  const totalTicks = Math.max(1, Math.round(durationMs / TICK_MS));
  const [tick, setTick] = useState(() =>
    prefersReducedMotion() ? totalTicks : 0,
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const interval = setInterval(() => {
      setTick((current) => {
        const next = current + 1;
        if (next >= totalTicks) clearInterval(interval);
        return Math.min(next, totalTicks);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [totalTicks]);

  const revealed = Math.floor((tick / totalTicks) * text.length);
  const display =
    tick >= totalTicks
      ? text
      : text
          .split("")
          .map((char, index) =>
            index < revealed || char === " " ? char : randomGlyph(),
          )
          .join("");

  return (
    <span className={className} aria-label={text} suppressHydrationWarning>
      {display}
    </span>
  );
}
