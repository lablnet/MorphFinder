import { Code, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { morphFileUrl, type ViewerProps } from '../types';
import { useHtmlViewer } from '@renderer/hooks/files/viewers/useHtmlViewer';

export function HtmlViewer({ filePath, node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  const { content, viewMode, setViewMode, loading } = useHtmlViewer(filePath);
  const fileUrl = morphFileUrl(filePath);

  return (
    <div className="flex h-full flex-col bg-shell-surface">
      {/* View Mode Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-shell-border bg-shell-sidebar/60 px-4 text-xs">
        <div className="flex items-center gap-1 rounded bg-black/5 dark:bg-white/5 p-0.5">
          <Button
            variant={viewMode === 'preview' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <Eye size={14} />
            <span>Rendered Preview</span>
          </Button>
          <Button
            variant={viewMode === 'source' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('source')}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <Code size={14} />
            <span>Source Code</span>
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={onOpenWithSystem} className="gap-1.5 h-7 text-xs">
          <ExternalLink size={12} />
          <span>Open with System App</span>
        </Button>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'preview' ? (
          <iframe
            src={fileUrl}
            sandbox="allow-scripts allow-same-origin"
            className="h-full w-full border-none bg-white"
            title={node.name}
          />
        ) : loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-current/50 text-sm">
            <Loader2 size={24} className="animate-spin text-shell-accent" />
            <span>Loading HTML code...</span>
          </div>
        ) : (
          <div className="h-full overflow-auto p-4 font-mono text-xs leading-relaxed bg-black/90 text-emerald-400">
            <pre>{content}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
