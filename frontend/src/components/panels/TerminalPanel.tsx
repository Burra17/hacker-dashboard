import Panel from "@/components/Panel";

export default function TerminalPanel({ className }: { className?: string }) {
  return (
    <Panel title="terminal" className={className}>
      <p className="text-muted">
        <span className="text-accent">guest@hacker-dashboard</span>:~$ _
      </p>
    </Panel>
  );
}
