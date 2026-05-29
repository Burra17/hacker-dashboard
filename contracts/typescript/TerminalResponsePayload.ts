/**
 * One streamed chunk of an AI prompt response on the `terminal.response` channel.
 * Tokens arrive in order; the final event sets `done` with an empty token.
 */
export interface TerminalResponsePayload {
  token: string;
  done: boolean;
}
