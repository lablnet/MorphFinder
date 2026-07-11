import React from 'react';

interface MetaRowProps {
  label: string;
  value: string | null;
}

/** A single label/value row used inside the ProjectMetaCard. */
export function MetaRow({ label, value }: MetaRowProps): React.JSX.Element | null {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-shell-border/50 last:border-0">
      <span className="text-xs text-current/50 shrink-0">{label}</span>
      <span className="text-xs text-current font-mono text-right break-all">{value}</span>
    </div>
  );
}
