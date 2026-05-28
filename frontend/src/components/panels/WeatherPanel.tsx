import Panel from "@/components/Panel";

export default function WeatherPanel({ className }: { className?: string }) {
  return (
    <Panel title="weather" className={className}>
      <p className="text-muted">{"// väder — kopplas i Fas 4"}</p>
    </Panel>
  );
}
