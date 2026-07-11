import React from 'react';
import { GitBranch } from 'lucide-react';
import type { GitStatus } from '@shared/types/git';
import type { UIShell } from '@shared/types/layout';
import { Button } from '../ui/Button';
import { cn } from '@lablnet/ui';

interface GitRadarProps {
  activePath: string;
  activeShell: UIShell;
  gitStatus: GitStatus | null;
  isOpen: boolean;
  toggleOpen: () => void;
}

export function GitRadar({
  activePath,
  activeShell,
  gitStatus,
  toggleOpen,
}: GitRadarProps): React.JSX.Element | null {
  // Don't render if it's a virtual location (e.g. morph://)
  if (activePath.startsWith('morph://')) {
    return null;
  }

  const isRepo = gitStatus?.isRepo ?? false;
  const isInstalled = gitStatus?.isInstalled ?? true;

  // Count changes to show a badge on the button
  const modifiedCount = Object.values(gitStatus?.statusMap ?? {}).filter(
    (s) => s === 'modified' || s === 'staged' || s === 'added' || s === 'untracked'
  ).length;

  return (
    <Button
      title={
        !isInstalled
          ? 'Git not installed'
          : !isRepo
          ? 'Not a Git repository'
          : `Git Radar: ${gitStatus?.branch} (${modifiedCount} changes)`
      }
      aria-label="Git Radar"
      onClick={toggleOpen}
      size="icon"
      shellId={activeShell}
      className={cn(
        'relative transition-all',
        isRepo && modifiedCount > 0 && 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
      )}
    >
      <GitBranch size={15} />
      {isRepo && modifiedCount > 0 && (
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
    </Button>
  );
}
