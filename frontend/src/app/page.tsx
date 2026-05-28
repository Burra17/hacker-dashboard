import TickerPanel from "@/components/panels/TickerPanel";
import SystemLogsPanel from "@/components/panels/SystemLogsPanel";
import WeatherPanel from "@/components/panels/WeatherPanel";
import SportsPanel from "@/components/panels/SportsPanel";
import TerminalPanel from "@/components/panels/TerminalPanel";

// Static panel shells for Issue 2.4 — placeholder text only.
// Live data wiring (SignalR/TanStack Query) arrives in Fas 3.
export default function Home() {
  return (
    <main className="grid h-screen grid-cols-2 grid-rows-[auto_1fr_1fr_auto] bg-bg">
      <TickerPanel className="col-span-2" />
      <SystemLogsPanel className="row-span-2" />
      <WeatherPanel />
      <SportsPanel />
      <TerminalPanel className="col-span-2" />
    </main>
  );
}
