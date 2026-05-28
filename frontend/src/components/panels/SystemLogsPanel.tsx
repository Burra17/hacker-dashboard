import Panel from "@/components/Panel";

export default function SystemLogsPanel({ className }: { className?: string }) {
  return (
    <Panel title="system.logs" className={className}>
      <p className="text-muted">{"// väntar på stream — kopplas i Fas 3"}</p>
    </Panel>
  );
}
