const BAR_WIDTH = 24;
const FILLED_GLYPH = "█";
const EMPTY_GLYPH = "░";

interface AsciiProgressBarProps {
  /** Progress fraction, 0..1. */
  progress: number;
  className?: string;
}

/** Renders progress as a monospace `[████░░░░] 50%` bar. */
export default function AsciiProgressBar({
  progress,
  className,
}: AsciiProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const filledCount = Math.round(clamped * BAR_WIDTH);
  const bar =
    FILLED_GLYPH.repeat(filledCount) + EMPTY_GLYPH.repeat(BAR_WIDTH - filledCount);
  const percent = Math.round(clamped * 100)
    .toString()
    .padStart(3, " ");

  return (
    <div className={className}>
      <span className="text-accent">[{bar}]</span>{" "}
      <span className="text-muted">{percent}%</span>
    </div>
  );
}
