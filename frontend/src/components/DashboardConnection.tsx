"use client";

import { useEffect } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getConnection, RECEIVE_DASHBOARD_EVENT } from "@/lib/signalr/connection";
import { routeDashboardEvent } from "@/lib/signalr/routeDashboardEvent";

/**
 * Owns the SignalR connection lifecycle. Renders nothing — mounted once near the
 * app root to open the singleton connection and register the central event router.
 */
export default function DashboardConnection() {
  useEffect(() => {
    const connection = getConnection();
    connection.on(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);

    if (connection.state === HubConnectionState.Disconnected) {
      connection
        .start()
        .catch((error) => console.error("SignalR connection failed", error));
    }

    return () => {
      connection.off(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);
    };
  }, []);

  return null;
}
