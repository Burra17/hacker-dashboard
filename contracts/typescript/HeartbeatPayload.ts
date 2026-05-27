/** Payload for the "heartbeat" channel — periodic liveness ping. */
export interface HeartbeatPayload {
  /** Monotonic beat counter since server start (starts at 1). */
  sequence: number;
}
