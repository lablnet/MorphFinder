import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { CacheTarget } from '@shared/types/cache';
import { formatBytes } from '../../../hooks/files/useCacheCleaner';

interface ConfirmDialogsProps {
  activeShell: string;
  showFirstConfirm: boolean;
  setShowFirstConfirm: (show: boolean) => void;
  showSecondConfirm: boolean;
  setShowSecondConfirm: (show: boolean) => void;
  selectedIds: Set<string>;
  totalSelectedSize: number;
  targets: CacheTarget[];
  hasApplicationSupportSelected: boolean;
  handleClean: () => void;
}

export function ConfirmDialogs({
  activeShell,
  showFirstConfirm,
  setShowFirstConfirm,
  showSecondConfirm,
  setShowSecondConfirm,
  selectedIds,
  totalSelectedSize,
  targets,
  hasApplicationSupportSelected,
  handleClean,
}: ConfirmDialogsProps): React.JSX.Element | null {
  // Determine OS layout style
  const getDialogStyle = () => {
    switch (activeShell) {
      case 'explorer':
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity',
          content: 'w-full max-w-lg rounded-none border-2 border-[#0067c0] dark:border-[#4cc2ff] bg-shell-surface p-5 shadow-2xl flex flex-col font-sans text-current',
          contentStyle: undefined,
          btnConfirm: 'bg-[#0067c0] hover:bg-[#0067c0]/90 text-white font-normal rounded-none border border-black/10 px-4 py-1 text-sm',
          btnCancel: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-shell-border text-current rounded-none px-4 py-1 text-sm',
          title: 'text-base font-semibold text-current mb-3'
        };
      case 'dolphin':
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity',
          content: 'w-full max-w-lg rounded-shell border border-shell-border bg-shell-surface p-5 shadow-xl flex flex-col text-current',
          contentStyle: undefined,
          btnConfirm: 'bg-[color:var(--shell-accent)] hover:bg-[color:var(--shell-accent)]/90 text-white font-medium rounded-shell border-none px-4 py-1.5 text-sm',
          btnCancel: 'bg-transparent hover:bg-black/5 border border-shell-border text-current rounded-shell px-4 py-1.5 text-sm',
          title: 'text-base font-bold text-current mb-3'
        };
      default: // finder / mac
        return {
          overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity',
          content: 'w-full max-w-md rounded-2xl border border-shell-border shadow-2xl flex flex-col p-6 backdrop-blur-xl text-current',
          contentStyle: { 
            backgroundColor: 'color-mix(in srgb, var(--shell-surface) 92%, transparent)', 
            color: 'currentColor' 
          },
          btnConfirm: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-shell border-none px-4 py-1.5 text-sm shadow-sm',
          btnCancel: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-shell-border text-current rounded-shell px-4 py-1.5 text-sm',
          title: 'text-lg font-bold text-current mb-2 tracking-tight text-center'
        };
    }
  };

  const ds = getDialogStyle();

  if (!showFirstConfirm && !showSecondConfirm) return null;

  return (
    <>
      {/* Confirmation Dialog 1 */}
      {showFirstConfirm && (
        <div className={ds.overlay}>
          <div className={ds.content} style={ds.contentStyle}>
            <div className="flex items-center gap-2.5 mb-3 text-yellow-500 shrink-0">
              <AlertTriangle size={activeShell === 'explorer' ? 20 : 24} />
              <h3 className={ds.title}>Confirm Cache Deletion</h3>
            </div>
            
            <p className="text-current/75 mb-3 shrink-0 text-xs">
              You are about to permanently delete the following <strong>{selectedIds.size}</strong> selected items, freeing <strong className="text-shell-accent">{formatBytes(totalSelectedSize)}</strong> of disk space:
            </p>
            
            {/* Scrollable Target list details */}
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-shell-border bg-shell-sidebar/20 rounded-shell p-3 mb-4 divide-y divide-shell-border text-xs max-h-[30vh]">
              {targets.filter(t => selectedIds.has(t.id)).map(t => (
                <div key={t.id} className="py-2 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="font-semibold text-current block">{t.name}</span>
                    <span className="text-[10px] text-current/40 block font-mono truncate">{t.path}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-current">{formatBytes(t.sizeInBytes)}</span>
                </div>
              ))}
            </div>

            <div className={`flex justify-end gap-2 shrink-0 ${activeShell === 'finder' ? 'flex-row-reverse justify-center gap-4 mt-2' : ''}`}>
              <button 
                onClick={() => { setShowFirstConfirm(false); setShowSecondConfirm(true); }} 
                className={ds.btnConfirm}
              >
                Yes, Proceed
              </button>
              <button onClick={() => setShowFirstConfirm(false)} className={ds.btnCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog 2 */}
      {showSecondConfirm && (
        <div className={ds.overlay}>
          <div className={ds.content} style={ds.contentStyle}>
            <div className="flex items-center gap-2.5 mb-3 text-red-500">
              <ShieldAlert size={activeShell === 'explorer' ? 22 : 26} className="animate-bounce" />
              <h3 className={ds.title}>Final Irreversible Warning</h3>
            </div>
            
            <p className="text-current/80 mb-5 leading-relaxed text-xs">
              This is a <strong>permanent deletion</strong>. These files cannot be restored from the Trash.
              {hasApplicationSupportSelected && (
                <span className="block mt-2 font-medium">
                  Some selected items contain <strong>Application Support Data</strong>. Deleting them will log you out, clear settings, and reset histories for those applications.
                </span>
              )}
              <span className="block mt-3 font-semibold text-current">Are you absolutely sure you want to delete these files forever?</span>
            </p>

            <div className={`flex justify-end gap-2 shrink-0 ${activeShell === 'finder' ? 'flex-row-reverse justify-center gap-4 mt-2' : ''}`}>
              <button 
                onClick={() => { setShowSecondConfirm(false); handleClean(); }} 
                className={`${ds.btnConfirm} bg-red-600 hover:bg-red-700`}
              >
                Yes, Permanent Delete
              </button>
              <button onClick={() => { setShowSecondConfirm(false); setShowFirstConfirm(true); }} className={ds.btnCancel}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
