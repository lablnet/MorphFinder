import { ChevronRight, Clock3, Code2, Copy, HardDrive, PieChart, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@lablnet/ui';
import {
  THIS_PC_PATH,
  CACHE_CLEANER_PATH,
  SPACE_ANALYZER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  FILE_TIMELINE_PATH,
  SMART_COLLECTIONS_PATH,
  smartCollectionPath,
} from '@shared/constants';
import { SMART_COLLECTIONS } from '@shared/types/smartCollections';
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

function virtualBreadcrumb(path: string): { icon: typeof HardDrive; segments: Segment[] } | null {
  if (path === THIS_PC_PATH) {
    return { icon: HardDrive, segments: [{ name: 'This PC', path: THIS_PC_PATH }] };
  }
  if (path === CACHE_CLEANER_PATH) {
    return { icon: Trash2, segments: [{ name: 'Cache Cleaner', path: CACHE_CLEANER_PATH }] };
  }
  if (path === SPACE_ANALYZER_PATH) {
    return { icon: PieChart, segments: [{ name: 'Space Analyzer', path: SPACE_ANALYZER_PATH }] };
  }
  if (path === DEV_PANEL_PATH) {
    return { icon: Code2, segments: [{ name: 'Dev Panel', path: DEV_PANEL_PATH }] };
  }
  if (path === DUPLICATE_FINDER_PATH) {
    return { icon: Copy, segments: [{ name: 'Duplicate Finder', path: DUPLICATE_FINDER_PATH }] };
  }
  if (path === FILE_TIMELINE_PATH) {
    return { icon: Clock3, segments: [{ name: 'File Timeline', path: FILE_TIMELINE_PATH }] };
  }
  if (path === SMART_COLLECTIONS_PATH || path.startsWith(`${SMART_COLLECTIONS_PATH}/`)) {
    const collectionId = path.slice(SMART_COLLECTIONS_PATH.length + 1);
    const collection = SMART_COLLECTIONS.find((item) => item.id === collectionId);
    return {
      icon: Sparkles,
      segments: [
        { name: 'Smart Collections', path: SMART_COLLECTIONS_PATH },
        ...(collection ? [{ name: collection.label, path: smartCollectionPath(collection.id) }] : []),
      ],
    };
  }
  return null;
}

export function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps): React.JSX.Element {
  const virtual = virtualBreadcrumb(path);
  if (virtual !== null) {
    const Icon = virtual.icon;
    return (
      <nav className="scrollbar-none flex h-8 min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap px-3 text-sm text-current/80" aria-label="Breadcrumb">
        <Button
          onClick={() => onNavigate(virtual.segments[0]?.path ?? path)}
          variant="ghost"
          className="flex shrink-0 items-center p-1"
          aria-label={virtual.segments[0]?.name ?? 'Virtual location'}
        >
          <Icon size={14} />
        </Button>
        {virtual.segments.map((segment, index) => (
          <span key={segment.path} className="flex min-w-0 shrink-0 items-center gap-1">
            <ChevronRight size={12} className="text-current/40" />
            <Button
              onClick={() => onNavigate(segment.path)}
              variant="ghost"
              className={cn(
                'min-w-0 max-w-64 shrink px-1.5 py-0.5',
                index === virtual.segments.length - 1 && 'font-medium text-current',
              )}
              title={segment.name}
            >
              <span className="block truncate">{segment.name}</span>
            </Button>
          </span>
        ))}
      </nav>
    );
  }

  const segments = segmentsFromPath(path);

  return (
    <nav className="scrollbar-none flex h-8 min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap px-3 text-sm text-current/80" aria-label="Breadcrumb">
      <Button
        onClick={() => onNavigate(segments[0]?.path ?? '/')}
        variant="ghost"
        className="flex shrink-0 items-center p-1"
        aria-label="Root"
      >
        <HardDrive size={14} />
      </Button>
      {segments.map((segment, index) => (
        <span key={segment.path} className="flex min-w-0 shrink-0 items-center gap-1">
          <ChevronRight size={12} className="text-current/40" />
          <Button
            onClick={() => onNavigate(segment.path)}
            variant="ghost"
            className={cn(
              'min-w-0 max-w-64 shrink px-1.5 py-0.5',
              index === segments.length - 1 && 'font-medium text-current',
            )}
            title={segment.name}
          >
            <span className="block truncate">{segment.name}</span>
          </Button>
        </span>
      ))}
    </nav>
  );
}
