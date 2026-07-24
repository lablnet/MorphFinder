import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { ViewerProps } from '../types';

export function PdfViewer({ node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col bg-shell-surface">
      {/* Top Banner */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-shell-border bg-shell-sidebar/60 px-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText size={18} className="text-red-500" />
          <span>{node.name}</span>
          <span className="text-xs text-current/50 font-normal">(PDF)</span>
        </div>

        <Button variant="accent" size="sm" onClick={onOpenWithSystem} className="gap-1.5 h-8 text-xs">
          <ExternalLink size={14} />
          <span>Open with System App</span>
        </Button>
      </div>

      {/* Main Metadata & Action View */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-4 shadow-sm">
          <FileText size={48} />
        </div>
        <h2 className="text-lg font-semibold text-current">{node.name}</h2>
        <p className="text-xs text-current/50 mt-1 mb-6 font-mono">
          {formatBytes(node.sizeInBytes)} • Modified {formatModifiedDate(node.modifiedAt)}
        </p>

        <p className="max-w-md text-xs text-current/60 mb-6 leading-relaxed">
          PDF documents can be opened in your default system viewer (Preview, Acrobat, Edge, etc.) for high fidelity rendering.
        </p>

        <Button variant="accent" onClick={onOpenWithSystem} className="gap-2 px-6">
          <ExternalLink size={18} />
          <span>Open with System App</span>
        </Button>
      </div>
    </div>
  );
}
