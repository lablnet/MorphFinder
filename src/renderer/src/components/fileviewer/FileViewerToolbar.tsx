import { ArrowLeft, ExternalLink, X } from 'lucide-react';
import { cn } from '@lablnet/ui';
import { FileIcon } from '../fileicons/FileIcon';
import { Button } from '../ui/Button';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { formatBytes } from '@renderer/lib/format';

interface FileViewerToolbarProps {
  node: FileSystemNode;
  onClose: () => void;
  onOpenWithSystem: () => void;
}

export function FileViewerToolbar({
  node,
  onClose,
  onOpenWithSystem,
}: FileViewerToolbarProps): React.JSX.Element {
  const isMac = typeof navigator !== 'undefined' && (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));
  return (
    <div
      className={cn(
        'flex h-12 shrink-0 items-center gap-2 border-b border-shell-border bg-shell-surface/80 pr-3',
        'backdrop-blur-xl',
        // Make the toolbar draggable so users can move the window
        'app-region-drag',
        isMac ? 'pl-20' : 'pl-3',
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Back / Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        title="Close viewer (Esc)"
        className="app-region-no-drag"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <ArrowLeft size={16} />
      </Button>

      {/* File info */}
      <div className="flex min-w-0 flex-1 items-center gap-2 app-region-no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <FileIcon node={node} size={20} />
        <span className="truncate text-sm font-medium">{node.name}</span>
        <span className="hidden shrink-0 text-xs text-current/50 sm:inline">
          {node.kind === 'file' ? formatBytes(node.sizeInBytes) : ''}
        </span>
      </div>

      {/* Open with system */}
      <Button
        onClick={onOpenWithSystem}
        variant="outline"
        className="app-region-no-drag gap-1.5 text-xs"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        title="Open with default system app"
      >
        <ExternalLink size={14} />
        <span className="hidden sm:inline">Open with System</span>
      </Button>

      {/* Close */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        title="Close"
        className="app-region-no-drag"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
