"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { POLL_INTERVAL_MS } from "@/lib/config";

/**
 * Owns the TanStack Query client for HTTP-fetched server data (weather, sports).
 * Mounted once near the app root. This is the polling/caching side of the state
 * boundary — SignalR-streamed data lives in Zustand, never here.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  // Create the client once per browser session (lazy initial state, not on every render).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: POLL_INTERVAL_MS,
            // Recover promptly from a transient fetch error (e.g. the API wasn't ready on
            // first load): refetch when the tab regains focus or the network reconnects, so a
            // healthy backend clears the panel's dimmed/stale state without waiting for the
            // next 5-minute poll.
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
