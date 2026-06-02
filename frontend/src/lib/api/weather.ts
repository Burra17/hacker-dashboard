import { useQuery } from "@tanstack/react-query";
import type { WeatherPayload } from "@contracts/WeatherPayload";
import { api } from "@/lib/api/axios";
import { POLL_INTERVAL_MS } from "@/lib/config";

export const WEATHER_QUERY_KEY = ["weather"] as const;

async function fetchWeather(): Promise<WeatherPayload> {
  const { data } = await api.get<WeatherPayload>("/api/weather");
  return data;
}

/** Polls current weather over HTTP (TanStack Query side of the state boundary — never Zustand). */
export function useWeatherQuery() {
  return useQuery({
    queryKey: WEATHER_QUERY_KEY,
    queryFn: fetchWeather,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
