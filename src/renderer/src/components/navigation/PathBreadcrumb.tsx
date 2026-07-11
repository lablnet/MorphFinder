import { ChevronRight, HardDrive } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { THIS_PC_PATH } from '@shared/constants';

export interface PathBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

interface Segment {
  name: string;
  path: string;
}

/** Splits an absolute path into clickable segments. Handles both POSIX (`/a/b`) and
 *  Windows (`C:\a\b`) separators since the shell may run on either. */
function segmentsFromPath(path: string): Segment[] {
  const isWindows = /^[a-zA-Z]:\\/.test(path);
  const separator = isWindows ? '\\' : '/';
  const parts = path.split(separator).filter((part) => part.length > 0);

  return parts.map((name, index) => ({
    name,
    path: isWindows ? parts.slice(0, index + 1).join(separator) + separator : separator + parts.slice(0, index + 1).join(separator),
  }));
}

export function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps): React.JSX.Element {
  if (path === THIS_PC_PATH) {
    return (
      <nav className="flex h-8 items-center gap-1 overflow-x-auto px-3 text-sm text-current/80" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => onNavigate(THIS_PC_PATH)}
          className="flex shrink-0 items-center gap-2 rounded-shell px-1.5 py-0.5 font-medium text-current hover:bg-shell-sidebar"
        >
          <HardDrive size={14} />
          This PC
        </button>
      </nav>
    );
  }

  const segments = segmentsFromPath(path);

  return (
    <nav className="flex h-8 items-center gap-1 overflow-x-auto px-3 text-sm text-current/80" aria-label="Breadcrumb">
      <button
        type="button"
        onClick={() => onNavigate(segments[0]?.path ?? '/')}
        className="flex shrink-0 items-center rounded-shell p-1 hover:bg-shell-sidebar"
        aria-label="Root"
      >
        <HardDrive size={14} />
      </button>
      {segments.map((segment, index) => (
        <span key={segment.path} className="flex shrink-0 items-center gap-1">
          <ChevronRight size={12} className="text-current/40" />
          <button
            type="button"
            onClick={() => onNavigate(segment.path)}
            className={cn(
              'shrink-0 rounded-shell px-1.5 py-0.5 hover:bg-shell-sidebar',
              index === segments.length - 1 && 'font-medium text-current',
            )}
          >
            {segment.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
