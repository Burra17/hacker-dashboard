import { useQuery } from "@tanstack/react-query";
import type { SportsPayload } from "@contracts/SportsPayload";
import { api } from "@/lib/api/axios";
import { POLL_INTERVAL_MS } from "@/lib/config";

export const SPORTS_QUERY_KEY = ["sports"] as const;

async function fetchSports(): Promise<SportsPayload> {
  const { data } = await api.get<SportsPayload>("/api/sports");
  return data;
}

/** Polls team results/fixtures over HTTP (TanStack Query side of the state boundary — never Zustand). */
export function useSportsQuery() {
  return useQuery({
    queryKey: SPORTS_QUERY_KEY,
    queryFn: fetchSports,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
