import Panel from "@/components/Panel";

export default function TickerPanel({ className }: { className?: string }) {
  return (
    <Panel title="ticker" className={className}>
      <p className="whitespace-nowrap tracking-widest text-muted">
        {"// live ticker — strömmande data kopplas i Fas 3"}
      </p>
    </Panel>
  );
}
