/**
 * Latest result and next fixture for the followed teams (Hammarby, Chelsea), fetched on demand
 * over HTTP (polled by the frontend via TanStack Query — not streamed over SignalR).
 * Mirrors the C# SportsPayload record.
 */
export interface SportsPayload {
  /** Summary for Hammarby. */
  hammarby: TeamSportsSummary;
  /** Summary for Chelsea. */
  chelsea: TeamSportsSummary;
  /** When the reading was produced — ISO 8601, UTC. */
  observedAt: string;
  /** True when the upstream source was unavailable and this is the last known value. */
  stale: boolean;
}

/** Per-team summary: the most recent result and the upcoming fixture. */
export interface TeamSportsSummary {
  /** Team name. */
  team: string;
  /** Most recent result, e.g. "Hammarby 2 - 0 AIK" (used in the ticker). */
  latestResult: string;
  /** The upcoming fixture (shown in the sports panel). */
  nextMatch: NextMatch;
}

/** An upcoming fixture, split into display-ready fields. */
export interface NextMatch {
  /** Match date, ISO "yyyy-MM-dd". */
  date: string;
  /** Kick-off time, "HH:mm" (local). */
  time: string;
  /** The opposing team. */
  opponent: string;
}
