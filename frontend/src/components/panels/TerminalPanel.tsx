"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import Panel from "@/components/Panel";
import { useDashboardStore } from "@/store/useDashboardStore";
import { executeTerminalCommand } from "@/lib/terminal/executeTerminalCommand";
import { applySideEffect } from "@/lib/terminal/applySideEffect";
import { completeCommand } from "@/lib/terminal/commands";

const PROMPT = "guest@hacker-dashboard:~$";

export default function TerminalPanel({ className }: { className?: string }) {
  const input = useDashboardStore((s) => s.input);
  const setInput = useDashboardStore((s) => s.setInput);
  const history = useDashboardStore((s) => s.history);
  const pushLine = useDashboardStore((s) => s.pushLine);
  const pushCommand = useDashboardStore((s) => s.pushCommand);
  const recallPrevious = useDashboardStore((s) => s.recallPrevious);
  const recallNext = useDashboardStore((s) => s.recallNext);
  const clearHistory = useDashboardStore((s) => s.clearHistory);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [history]);

  // Land the cursor in the prompt on mount, like opening a fresh terminal.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const raw = input;
    if (raw.trim() === "") return;

    pushLine({ kind: "command", text: raw });
    pushCommand(raw);
    setInput("");

    try {
      const result = await executeTerminalCommand(raw);
      // Prompt acks carry no output of their own — the streamed tokens are the response.
      if (result.output) pushLine({ kind: "output", text: result.output });
      if (result.sideEffect) applySideEffect(result.sideEffect);
    } catch {
      pushLine({ kind: "output", text: "error: command could not reach the backend" });
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      recallPrevious();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      recallNext();
      return;
    }
    if (event.key === "Tab") {
      // Keep focus in the prompt and auto-fill a uniquely matching command.
      event.preventDefault();
      const completed = completeCommand(input);
      if (completed) setInput(completed);
      return;
    }
    // Emacs-style line shortcuts that browsers don't give a text input for free.
    if (event.ctrlKey) {
      const field = event.currentTarget;
      switch (event.key) {
        case "a":
          event.preventDefault();
          field.setSelectionRange(0, 0);
          return;
        case "e":
          event.preventDefault();
          field.setSelectionRange(field.value.length, field.value.length);
          return;
        case "u":
          event.preventDefault();
          setInput("");
          return;
        case "l":
          event.preventDefault();
          clearHistory();
          return;
      }
    }
  };

  // Clicking the panel focuses the prompt, but don't steal an in-progress text selection.
  const handleClick = () => {
    if (window.getSelection()?.toString() === "") {
      inputRef.current?.focus();
    }
  };

  return (
    <Panel title="terminal" className={className}>
      <div className="flex min-h-full flex-col" onClick={handleClick}>
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
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
