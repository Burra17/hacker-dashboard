import Panel from "@/components/Panel";
import LiveIndicator from "@/components/LiveIndicator";

export default function TickerPanel({ className }: { className?: string }) {
  return (
    <Panel title="ticker" className={className}>
      <div className="flex items-center gap-4">
        <LiveIndicator />
        <p className="whitespace-nowrap tracking-widest text-muted">
          {"// live ticker — strömmande data kopplas i Fas 3"}
        </p>
      </div>
    </Panel>
  );
}
