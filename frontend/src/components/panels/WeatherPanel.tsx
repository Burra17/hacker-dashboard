"use client";

import Panel from "@/components/Panel";
import { useWeatherQuery } from "@/lib/api/weather";

export default function WeatherPanel({ className }: { className?: string }) {
  const { data, isError, isPending } = useWeatherQuery();
  // Dim on a failed refresh (keep last-known data) or when the backend flags the value stale.
  const stale = isError || (data?.stale ?? false);

  return (
    <Panel title="weather" className={className} stale={stale}>
      {data ? (
        <ul className="space-y-0.5">
          <li>
            <span className="text-muted">plats: </span>
            <span className="text-accent">{data.location}</span>
          </li>
          <li>
            <span className="text-muted">temp: </span>
            <span className="text-accent">{data.temperatureCelsius.toFixed(1)}°C</span>
          </li>
          <li>
            <span className="text-muted">förhållande: </span>
            <span className="text-accent">{data.condition}</span>
          </li>
        </ul>
      ) : isPending ? (
        <p className="text-muted">{"// hämtar väder…"}</p>
      ) : (
        <p className="text-muted">{"// väder otillgängligt"}</p>
      )}
    </Panel>
  );
}
