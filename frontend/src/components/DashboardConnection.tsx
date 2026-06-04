"use client";

import { useEffect } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getConnection, RECEIVE_DASHBOARD_EVENT } from "@/lib/signalr/connection";
import { routeDashboardEvent } from "@/lib/signalr/routeDashboardEvent";
import { useDashboardStore } from "@/store/useDashboardStore";

// The backend may still be warming up when the client loads. `withAutomaticReconnect`
// only kicks in after a successful first connect, so retry the initial start ourselves.
const CONNECT_RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Owns the SignalR connection lifecycle. Renders nothing — mounted once near the
 * app root to open the singleton connection, register the central event router,
 * and reflect connect/reconnect/close into the connection slice.
 */
export default function DashboardConnection() {
  useEffect(() => {
    const connection = getConnection();
    const { setStatus } = useDashboardStore.getState();
    let cancelled = false;

    connection.on(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);
    connection.onreconnecting(() => setStatus("reconnecting"));
    connection.onreconnected(() => setStatus("online"));
    connection.onclose(() => setStatus("offline"));

    // Stay "connecting" across retries so the uplink isn't marked failed/offline
    // while the backend boots — the boot sequence keeps waiting on it.
    async function startWithRetry() {
      setStatus("connecting");
      while (!cancelled) {
        try {
          await connection.start();
          setStatus("online");
          return;
        } catch (error) {
          console.error("SignalR connection failed, retrying…", error);
          await delay(CONNECT_RETRY_DELAY_MS);
        }
      }
    }

    if (connection.state === HubConnectionState.Disconnected) {
      void startWithRetry();
    }

    return () => {
      cancelled = true;
      connection.off(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);
    };
  }, []);

  return null;
}
