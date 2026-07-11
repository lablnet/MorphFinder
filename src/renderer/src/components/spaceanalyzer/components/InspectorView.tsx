import React from 'react';
import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';
import { formatBytes } from '@renderer/lib/format';
import { Folder, File, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/Button';

interface InspectorViewProps {
  node: SpaceAnalyzerNode;
  onClose: () => void;
  onDrillDown: (node: SpaceAnalyzerNode) => void;
}

export function InspectorView({ node, onClose, onDrillDown }: InspectorViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col border border-shell-border bg-shell-sidebar/35 rounded-xl overflow-hidden shadow-lg animate-slide-up select-none min-h-[160px] max-h-[260px] shrink-0">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-shell-border px-3.5 py-2.5 bg-shell-surface/40 select-none">
        <div className="flex items-center gap-2 truncate min-w-0">
          {node.isDirectory ? (
            <Folder size={14} className="text-amber-500 shrink-0" />
          ) : (
            <File size={14} className="text-blue-500 shrink-0" />
          )}
          <span className="text-xs font-bold text-current truncate">
            {node.name}
          </span>
          <span className="text-[10px] font-mono text-current/40 truncate hidden sm:inline">
            ({node.path})
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {node.isDirectory && node.name !== '[Other Files & Folders]' && (
            <Button
              onClick={() => onDrillDown(node)}
              variant="ghost"
              className="h-6 text-[10px] px-2 py-0.5 flex items-center gap-1 hover:bg-shell-accent/15"
            >
              <span>Explore Folder</span>
              <ChevronRight size={10} />
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-shell-accent/15 hover:text-red-500 rounded text-current/60 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Main Details and Sub-items list */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-shell-border overflow-hidden flex-1 min-h-0">
        {/* Core details column */}
        <div className="p-3.5 flex flex-col justify-between shrink-0 md:w-56 text-xs text-current/75">
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-[10px] text-current/45 uppercase font-semibold">Allocated Size</span>
              <p className="text-sm font-extrabold text-current font-mono mt-0.5">
                {formatBytes(node.size)}
              </p>
            </div>
            {node.isDirectory && (
              <div>
                <span className="text-[10px] text-current/45 uppercase font-semibold">Child Count</span>
                <p className="font-semibold text-current/90 mt-0.5">
                  {node.fileCount} {node.fileCount === 1 ? 'file' : 'files'}
                </p>
              </div>
            )}
            {!node.isDirectory && (
              <div>
                <span className="text-[10px] text-current/45 uppercase font-semibold">File Path</span>
                <p className="font-mono text-[10px] text-current/60 break-all truncate mt-0.5" title={node.path}>
                  {node.path}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contents/Related items list column */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 p-3.5">
          <h5 className="text-[10px] uppercase font-bold tracking-wider text-current/40 mb-2">
            {node.isDirectory ? 'Contents & Sub-allocations' : 'File Specification'}
          </h5>
          
          {node.isDirectory ? (
            node.children && node.children.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 min-h-0">
                {node.children.map((child) => (
                  <div
                    key={child.path}
                    className="flex items-center justify-between p-1.5 hover:bg-shell-sidebar/50 rounded transition-colors text-[11px] cursor-pointer"
                    onDoubleClick={() => onDrillDown(child)}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {child.isDirectory ? (
                        <Folder size={11} className="text-amber-500/70 shrink-0" />
                      ) : (
                        <File size={11} className="text-blue-500/70 shrink-0" />
                      )}
                      <span className="truncate font-medium text-current/80">
                        {child.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-current/60 shrink-0 ml-3">
                      {formatBytes(child.size)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[11px] text-current/40 italic">
                Empty directory or deep folders not loaded.
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-1.5 text-xs text-current/70">
              <p>Double-click parent folders in the chart or switch to List mode to interact further.</p>
              {node.name !== '[Other Files & Folders]' && (
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    onClick={() => {
                      // Open path bundle in native OS handler if implemented
                      window.open(`file://${node.path}`);
                    }}
                    variant="outline"
                    className="h-7 text-[10px] font-semibold flex items-center gap-1"
                  >
                    <ExternalLink size={10} />
                    <span>Reveal File</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default InspectorView;
