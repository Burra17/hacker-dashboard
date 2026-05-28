import Panel from "@/components/Panel";

// Static layout for Issue 2.3 — placeholder content only.
// Live data wiring (SignalR/TanStack Query) arrives in Fas 3.
export default function Home() {
  return (
    <main className="grid h-screen grid-cols-2 grid-rows-[auto_1fr_1fr_auto] bg-bg">
      <Panel title="ticker" className="col-span-2">
        <p className="whitespace-nowrap tracking-widest text-muted">
          BTC 64,210 ▲ &nbsp; ETH 3,120 ▲ &nbsp; AAPL 229.8 ▼ &nbsp; SEK/USD
          10.42 &nbsp; // live ticker — Fas 3
        </p>
      </Panel>

      <Panel title="system.logs" className="row-span-2">
        <ul className="space-y-1 text-muted">
          <li>[12:00:01] boot sequence complete</li>
          <li>[12:00:02] hub connection: pending</li>
          <li>[12:00:03] awaiting stream — system.logs</li>
        </ul>
      </Panel>

      <Panel title="weather">
        <p className="text-muted">-- °C &nbsp; placeholder &nbsp; // Fas 4</p>
      </Panel>

      <Panel title="sports">
        <p className="text-muted">Allsvenskan &nbsp; -- : -- &nbsp; // Fas 4</p>
      </Panel>

      <Panel title="terminal" className="col-span-2">
        <p className="text-muted">
          <span className="text-accent">guest@hacker-dashboard</span>:~$ _
        </p>
      </Panel>
    </main>
  );
}
