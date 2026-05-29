"use client";

import { useEffect, useRef, type FormEvent } from "react";
import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";
import { executeTerminalCommand } from "@/lib/terminal/executeTerminalCommand";
import { applySideEffect } from "@/lib/terminal/applySideEffect";

const PROMPT = "guest@hacker-dashboard:~$";

export default function TerminalPanel({ className }: { className?: string }) {
  const input = useDashboardStore((s) => s.input);
  const setInput = useDashboardStore((s) => s.setInput);
  const history = useDashboardStore((s) => s.history);
  const pushLine = useDashboardStore((s) => s.pushLine);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const raw = input;
    if (raw.trim() === "") return;

    pushLine({ kind: "command", text: raw });
    setInput("");

    try {
      const result = await executeTerminalCommand(raw);
      // Prompt acks carry no output of their own — the streamed tokens are the response.
      if (result.output) pushLine({ kind: "output", text: result.output });
      if (result.sideEffect) applySideEffect(result.sideEffect);
    } catch {
      pushLine({ kind: "output", text: "error: command could not reach the backend" });
    }
  };

  return (
    <Panel title="terminal" className={className}>
      <div className="flex min-h-full flex-col">
        {history.map((line) => {
          if (line.kind === "command") {
            return (
              <div key={line.id} className="whitespace-pre-wrap break-words">
                <span className="text-accent">{PROMPT}</span>{" "}
                <span className="text-fg">{line.text}</span>
              </div>
            );
          }
          // AI responses read as primary text; command output stays muted.
          const tone = line.kind === "response" ? "text-fg" : "text-muted";
          return (
            <div
              key={line.id}
              className={`whitespace-pre-wrap break-words ${tone}`}
            >
              {line.text}
            </div>
          );
        })}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="shrink-0 text-accent">{PROMPT}</span>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="terminal input"
            className="min-w-0 flex-1 bg-transparent text-fg caret-current outline-none"
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
