import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { DASHBOARD_HUB_URL } from "@/lib/config";

/** Client method every DashboardEvent arrives on — mirrors DashboardHub.ReceiveEventMethod. */
export const RECEIVE_DASHBOARD_EVENT = "ReceiveDashboardEvent";

let connection: HubConnection | null = null;

/** Lazily create and reuse the single hub connection for the whole app. */
export function getConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder().withUrl(DASHBOARD_HUB_URL).build();
  }
  return connection;
}
