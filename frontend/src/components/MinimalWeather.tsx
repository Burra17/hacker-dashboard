"use client";

import { useWeatherQuery } from "@/lib/api/weather";

/**
 * Compact weather status for the dashboard header, e.g. `[ Hudiksvall: 20.7°C | Overcast ]`.
 * Polls over TanStack Query (state boundary — never Zustand) and dims when stale/offline.
 */
export default function MinimalWeather() {
  const { data, isError, isPending } = useWeatherQuery();
  const stale = isError || (data?.stale ?? false);

  if (!data) {
    return (
      <span className="shrink-0 whitespace-nowrap text-xs tracking-widest text-muted">
        {isPending ? "[ väder… ]" : "[ väder otillgängligt ]"}
      </span>
    );
  }

  return (
    <span
      className={`shrink-0 whitespace-nowrap text-xs tracking-widest text-muted transition-opacity ${stale ? "opacity-40" : ""}`}
    >
      {"[ "}
      <span className="text-accent">{data.location}</span>
      {": "}
      <span className="text-accent">{data.temperatureCelsius.toFixed(1)}°C</span>
      {" | "}
      <span className="text-accent">{data.condition}</span>
      {" ]"}
    </span>
  );
}
