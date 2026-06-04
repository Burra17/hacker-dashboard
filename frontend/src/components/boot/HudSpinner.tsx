const SPIN = "hud-spin";

interface HudSpinnerProps {
  className?: string;
}

/** Minimalist rotating geometric HUD spinner — concentric rings in theme accents. */
export default function HudSpinner({ className }: HudSpinnerProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g style={{ transformOrigin: "center", animation: `${SPIN} 6s linear infinite` }}>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="6 10"
          opacity="0.6"
        />
      </g>
      <g
        style={{
          transformOrigin: "center",
          animation: `${SPIN} 3s linear infinite reverse`,
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
          strokeDasharray="40 18"
          opacity="0.85"
        />
      </g>
      <g style={{ transformOrigin: "center", animation: `${SPIN} 9s linear infinite` }}>
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      </g>
      <circle cx="50" cy="50" r="3" fill="var(--accent)" />
    </svg>
  );
}
