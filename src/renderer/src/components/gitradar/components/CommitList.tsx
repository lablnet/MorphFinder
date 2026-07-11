import React from 'react';
import type { GitCommit } from '@shared/types/git';
import { GitCommit as CommitIcon, User, Calendar } from 'lucide-react';

interface CommitListProps {
  commits: GitCommit[];
}

export function CommitList({ commits }: CommitListProps): React.JSX.Element {
  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-current/45">
        <CommitIcon size={24} className="mb-2 opacity-50" />
        <span className="text-xs">No commits found in this branch</span>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-shell-border">
      {commits.map((commit) => (
        <div key={commit.hash} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-shell-surface border-2 border-shell-accent group-hover:scale-125 transition-transform" />

          {/* Commit content card */}
          <div className="rounded-shell border border-shell-border bg-shell-sidebar/20 hover:bg-shell-sidebar/40 p-3 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-current/80 line-clamp-2">
                {commit.message}
              </span>
              <span className="font-mono text-[10px] bg-shell-accent/10 text-shell-accent px-1.5 py-0.5 rounded shrink-0">
                {commit.hash}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-current/40">
              <span className="flex items-center gap-1">
                <User size={10} />
                <span className="truncate max-w-[80px]">{commit.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{commit.date}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
