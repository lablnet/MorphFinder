import { FileSpreadsheet, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import { useOfficeViewer } from '@renderer/hooks/files/viewers/useOfficeViewer';
import type { ViewerProps } from '../types';

export function OfficeViewer({ node, filePath, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  const { isSpreadsheet, tableData, docText, loading } = useOfficeViewer(filePath, node.extension);

  return (
    <div className="flex h-full flex-col bg-shell-surface">
      {/* Top Banner */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-shell-border bg-shell-sidebar/60 px-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isSpreadsheet ? <FileSpreadsheet size={18} className="text-emerald-500" /> : <FileText size={18} className="text-blue-500" />}
          <span>{node.name}</span>
          <span className="text-xs text-current/50 font-normal">({node.extension.toUpperCase()})</span>
        </div>

        <Button variant="accent" size="sm" onClick={onOpenWithSystem} className="gap-1.5 h-8 text-xs">
          <ExternalLink size={14} />
          <span>Open with System App</span>
        </Button>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-current/50 text-sm">
            <Loader2 size={24} className="animate-spin text-shell-accent" />
            <span>Parsing document preview...</span>
          </div>
        ) : isSpreadsheet && tableData.length > 0 ? (
          <div className="h-full overflow-auto rounded-shell border border-shell-border bg-white dark:bg-zinc-900 shadow-inner">
            <table className="w-full border-collapse text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-shell-border bg-shell-sidebar/80">
                  <th className="w-10 border-r border-shell-border p-2 text-center text-current/40">#</th>
                  {tableData[0]?.map((_, colIdx) => (
                    <th key={colIdx} className="border-r border-shell-border p-2 font-semibold text-current/70">
                      Col {colIdx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-shell-border/40 hover:bg-shell-accent/5">
                    <td className="border-r border-shell-border p-2 text-center text-current/40 bg-shell-sidebar/40 font-semibold select-none">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border-r border-shell-border p-2 truncate max-w-xs">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : docText && docText.length > 50 ? (
          <div className="mx-auto max-w-3xl rounded-shell border border-shell-border bg-white dark:bg-zinc-900 p-8 shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
            {docText}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-shell-accent/10 text-shell-accent">
              {isSpreadsheet ? <FileSpreadsheet size={40} /> : <FileText size={40} />}
            </div>
            <div>
              <h3 className="text-base font-semibold">{node.name}</h3>
              <p className="text-xs text-current/50">{formatBytes(node.sizeInBytes)} • Modified {formatModifiedDate(node.modifiedAt)}</p>
            </div>
            <p className="max-w-md text-xs text-current/60">
              Office documents are best edited in their native applications. Click below to open in your default app.
            </p>
            <Button variant="accent" onClick={onOpenWithSystem} className="gap-2">
              <ExternalLink size={16} />
              <span>Open with System App</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
