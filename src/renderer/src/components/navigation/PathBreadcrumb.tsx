import { ChevronRight, HardDrive, Trash2 } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { THIS_PC_PATH, CACHE_CLEANER_PATH } from '@shared/constants';
import { Button } from '../ui/Button';

export interface PathBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

interface Segment {
  name: string;
  path: string;
}

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
        <Button
          onClick={() => onNavigate(THIS_PC_PATH)}
          variant="ghost"
          className="flex shrink-0 items-center gap-2 px-1.5 py-0.5 font-medium text-current"
        >
          <HardDrive size={14} />
          This PC
        </Button>
      </nav>
    );
  }

  if (path === CACHE_CLEANER_PATH) {
    return (
      <nav className="flex h-8 items-center gap-1 overflow-x-auto px-3 text-sm text-current/80" aria-label="Breadcrumb">
        <Button
          onClick={() => onNavigate(CACHE_CLEANER_PATH)}
          variant="ghost"
          className="flex shrink-0 items-center gap-2 px-1.5 py-0.5 font-medium text-current"
        >
          <Trash2 size={14} />
          Cache Cleaner
        </Button>
      </nav>
    );
  }

  const segments = segmentsFromPath(path);

  return (
    <nav className="flex h-8 items-center gap-1 overflow-x-auto px-3 text-sm text-current/80" aria-label="Breadcrumb">
      <Button
        onClick={() => onNavigate(segments[0]?.path ?? '/')}
        variant="ghost"
        className="flex shrink-0 items-center p-1"
        aria-label="Root"
      >
        <HardDrive size={14} />
      </Button>
      {segments.map((segment, index) => (
        <span key={segment.path} className="flex shrink-0 items-center gap-1">
          <ChevronRight size={12} className="text-current/40" />
          <Button
            onClick={() => onNavigate(segment.path)}
            variant="ghost"
            className={cn(
              'shrink-0 px-1.5 py-0.5',
              index === segments.length - 1 && 'font-medium text-current',
            )}
          >
            {segment.name}
          </Button>
        </span>
      ))}
    </nav>
  );
}
