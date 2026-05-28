"use client";

import { useEffect, useRef, type FormEvent } from "react";
import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";

const PROMPT = "guest@hacker-dashboard:~$";

// Echo-only stub for Issue 3.6 — no command parsing yet (that lands in Fas 4).
export default function TerminalPanel({ className }: { className?: string }) {
  const input = useDashboardStore((s) => s.input);
  const setInput = useDashboardStore((s) => s.setInput);
  const history = useDashboardStore((s) => s.history);
  const pushHistory = useDashboardStore((s) => s.pushHistory);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (input.trim() === "") return;
    pushHistory(input);
    setInput("");
  };

  return (
    <Panel title="terminal" className={className}>
      <div className="flex min-h-full flex-col">
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-words">
            <span className="text-accent">{PROMPT}</span>{" "}
            <span className="text-fg">{line}</span>
          </div>
        ))}
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
