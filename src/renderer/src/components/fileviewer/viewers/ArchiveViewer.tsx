import { Archive, Download, File, Folder, HardDriveDownload, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatBytes } from '@renderer/lib/format';
import { useArchiveViewer } from '@renderer/hooks/files/viewers/useArchiveViewer';
import type { ViewerProps } from '../types';

export function ArchiveViewer({ node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  const { entries, loading, extracting, statusMessage, handleExtract } = useArchiveViewer(node);

  return (
    <div className="flex h-full flex-col bg-shell-surface p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-shell-border pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shell-accent/15 text-shell-accent">
            <Archive size={28} />
          </div>
          <div>
            <h2 className="text-base font-semibold">{node.name}</h2>
            <p className="text-xs text-current/50">
              {node.extension.toUpperCase()} Archive • {formatBytes(node.sizeInBytes)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            onClick={() => void handleExtract()}
            disabled={extracting}
            className="gap-2"
          >
            {extracting ? <Loader2 size={16} className="animate-spin" /> : <HardDriveDownload size={16} />}
            <span>Extract Here</span>
          </Button>
          <Button variant="outline" onClick={onOpenWithSystem} className="gap-2">
            <Download size={16} />
            <span>Open with System</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 rounded bg-shell-accent/10 border border-shell-accent/20 px-3 py-2 text-xs text-shell-accent">
          {statusMessage}
        </div>
      )}

      {/* Entries List */}
      <div className="flex-1 overflow-auto rounded-shell border border-shell-border bg-shell-sidebar/40">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-current/50 text-sm">
            <Loader2 size={24} className="animate-spin text-shell-accent" />
            <span>Reading archive items...</span>
          </div>
        ) : (
          <div className="divide-y divide-shell-border text-sm">
            {entries.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.isDirectory ? (
                    <Folder size={18} className="shrink-0 text-amber-500" />
                  ) : (
                    <File size={18} className="shrink-0 text-current/60" />
                  )}
                  <span className="truncate font-mono text-xs">{item.name}</span>
                </div>
                {item.size > 0 && (
                  <span className="text-xs text-current/50">{formatBytes(item.size)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
