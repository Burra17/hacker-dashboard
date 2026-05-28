/** Backend API origin; override per environment via NEXT_PUBLIC_API_BASE_URL. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5076";

/** SignalR hub endpoint — mirrors the backend route in Program.cs. */
export const DASHBOARD_HUB_URL = `${API_BASE_URL}/hubs/dashboard`;
