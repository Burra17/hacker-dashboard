/**
 * Severity of a system log line. camelCase string wire values, mirroring the
 * C# SystemLogLevel enum.
 */
export type SystemLogLevel = "debug" | "info" | "warning" | "error";

/**
 * Payload for the "system.logs" channel — one line in the rolling system log feed.
 * A `delta` event carries a single `SystemLogPayload`; a `snapshot` event carries the
 * recent history as `SystemLogPayload[]`.
 */
export interface SystemLogPayload {
  level: SystemLogLevel;
  /** Subsystem that emitted the line, e.g. "kernel", "auth", "net". */
  source: string;
  message: string;
}
