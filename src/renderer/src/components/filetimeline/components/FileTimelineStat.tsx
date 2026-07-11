export function FileTimelineStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-current/45">{label}</div>
      <div className="mt-1 text-lg font-bold text-shell-accent">{value}</div>
    </div>
  );
}
