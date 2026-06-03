import Panel from "@/components/Panel";
import LiveIndicator from "@/components/LiveIndicator";
import Ticker from "@/components/Ticker";
import MinimalWeather from "@/components/MinimalWeather";

interface TickerPanelProps {
  className?: string;
  /** Show the compact weather status on the right of the header. */
  showWeather?: boolean;
}

export default function TickerPanel({ className, showWeather = true }: TickerPanelProps) {
  return (
    <Panel title="ticker" className={className}>
      <div className="flex items-center gap-4">
        <span className="shrink-0">
          <LiveIndicator />
        </span>
        <Ticker />
        {showWeather && <MinimalWeather />}
      </div>
    </Panel>
  );
}
