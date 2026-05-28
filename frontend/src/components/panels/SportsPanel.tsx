import Panel from "@/components/Panel";

export default function SportsPanel({ className }: { className?: string }) {
  return (
    <Panel title="sports" className={className}>
      <p className="text-muted">{"// sport — kopplas i Fas 4"}</p>
    </Panel>
  );
}
