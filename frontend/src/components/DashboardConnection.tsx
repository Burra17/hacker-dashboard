"use client";

import { useEffect } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getConnection, RECEIVE_DASHBOARD_EVENT } from "@/lib/signalr/connection";
import { routeDashboardEvent } from "@/lib/signalr/routeDashboardEvent";
import { useDashboardStore } from "@/store/useDashboardStore";

/**
 * Owns the SignalR connection lifecycle. Renders nothing — mounted once near the
 * app root to open the singleton connection, register the central event router,
 * and reflect connect/reconnect/close into the connection slice.
 */
export default function DashboardConnection() {
  useEffect(() => {
    const connection = getConnection();
    const { setStatus } = useDashboardStore.getState();

    connection.on(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);
    connection.onreconnecting(() => setStatus("reconnecting"));
    connection.onreconnected(() => setStatus("online"));
    connection.onclose(() => setStatus("offline"));

    if (connection.state === HubConnectionState.Disconnected) {
      setStatus("connecting");
      connection
        .start()
        .then(() => setStatus("online"))
        .catch((error) => {
          setStatus("offline");
          console.error("SignalR connection failed", error);
        });
    }

    return () => {
      connection.off(RECEIVE_DASHBOARD_EVENT, routeDashboardEvent);
    };
  }, []);

  return null;
}
