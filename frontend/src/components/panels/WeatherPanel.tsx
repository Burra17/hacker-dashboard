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
        <dl className="space-y-1">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">plats</dt>
            <dd className="text-fg">{data.location}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">temp</dt>
            <dd className="text-accent">{data.temperatureCelsius.toFixed(1)}°C</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">förhållande</dt>
            <dd className="text-fg">{data.condition}</dd>
          </div>
        </dl>
      ) : isPending ? (
        <p className="text-muted">{"// hämtar väder…"}</p>
      ) : (
        <p className="text-muted">{"// väder otillgängligt"}</p>
      )}
    </Panel>
  );
}
