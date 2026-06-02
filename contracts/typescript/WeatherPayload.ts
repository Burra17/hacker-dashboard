/**
 * Current weather for the configured location, fetched on demand over HTTP (polled by the
 * frontend via TanStack Query — not streamed over SignalR). Mirrors the C# WeatherPayload record.
 */
export interface WeatherPayload {
  /** Human-readable name of the location the reading is for. */
  location: string;
  /** Current temperature in degrees Celsius. */
  temperatureCelsius: number;
  /** Human-readable sky condition, e.g. "Clear sky", "Overcast". */
  condition: string;
  /** When the reading was produced — ISO 8601, UTC. */
  observedAt: string;
  /** True when the upstream source was unavailable and this is the last known value. */
  stale: boolean;
}
