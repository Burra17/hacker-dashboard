import Panel from "@/components/Panel";
import LiveIndicator from "@/components/LiveIndicator";
import Ticker from "@/components/Ticker";

export default function TickerPanel({ className }: { className?: string }) {
  return (
    <Panel title="ticker" className={className}>
      <div className="flex items-center gap-4">
        <span className="shrink-0">
          <LiveIndicator />
        </span>
        <Ticker />
      </div>
    </Panel>
  );
}
