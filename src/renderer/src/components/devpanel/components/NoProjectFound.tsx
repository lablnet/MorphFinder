import React from 'react';
import { FolderSearch } from 'lucide-react';

interface NoProjectFoundProps {
  path: string;
}

export function NoProjectFound({ path }: NoProjectFoundProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-shell-sidebar text-current/30">
        <FolderSearch size={28} />
      </div>
      <div>
        <p className="text-sm font-semibold text-current/70">No project detected</p>
        <p className="mt-1 text-xs text-current/45 max-w-xs leading-relaxed">
          This directory doesn't contain a recognized project manifest
          (<span className="font-mono">package.json</span>, <span className="font-mono">Cargo.toml</span>, <span className="font-mono">pyproject.toml</span>, or <span className="font-mono">go.mod</span>).
        </p>
      </div>
      <p className="text-[10px] font-mono text-current/30 max-w-xs break-all">{path}</p>
    </div>
  );
}
