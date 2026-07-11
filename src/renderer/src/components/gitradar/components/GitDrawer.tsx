import React from 'react';
import { X, GitBranch, AlertCircle, FileText, CheckCircle, Info, RefreshCw } from 'lucide-react';
import type { GitStatus, GitCommit } from '@shared/types/git';
import { CommitList } from './CommitList';
import { Button } from '../../ui/Button';

interface GitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gitStatus: GitStatus | null;
  gitHistory: GitCommit[];
  isLoading: boolean;
  onRefresh: () => void;
  error: string | null;
}

export function GitDrawer({
  isOpen,
  onClose,
  gitStatus,
  gitHistory,
  isLoading,
  onRefresh,
  error,
}: GitDrawerProps): React.JSX.Element | null {
  if (!isOpen) return null;

  // Get total changes count
  const modifiedCount = Object.values(gitStatus?.statusMap ?? {}).filter(
    (s) => s === 'modified' || s === 'staged'
  ).length;
  const untrackedCount = Object.values(gitStatus?.statusMap ?? {}).filter(
    (s) => s === 'untracked'
  ).length;
  const addedCount = Object.values(gitStatus?.statusMap ?? {}).filter(
    (s) => s === 'added'
  ).length;

  const totalChanges = modifiedCount + untrackedCount + addedCount;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-[1px] animate-fade-in"
      onClick={() => {
        console.log('GitDrawer backdrop clicked, closing...');
        onClose();
      }}
      role="presentation"
    >
      <div
        className="w-80 h-full border-l border-shell-border bg-shell-surface shadow-2xl flex flex-col animate-slide-left text-current"
        onClick={(e) => {
          console.log('GitDrawer inner content clicked, stopping propagation');
          e.stopPropagation();
        }}
        role="dialog"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-shell-border px-4 py-3 bg-shell-sidebar/10">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-shell-accent" />
            <span className="font-bold text-sm">Git Radar</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button
              onClick={(e) => {
                console.log('GitDrawer refresh clicked');
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isLoading}
              className="p-1 hover:bg-shell-sidebar/40 rounded transition-colors text-current/50 hover:text-current cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={(e) => {
                console.log('GitDrawer close clicked');
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-shell-sidebar/40 rounded transition-colors text-current/50 hover:text-current cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5">
          {error !== null ? (
            /* Connection Error */
            <div className="rounded-shell border border-red-500/20 bg-red-500/10 p-4 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-red-500" />
              <div>
                <h4 className="font-bold text-sm text-red-500">Connection Error</h4>
                <p className="text-xs text-current/60 mt-1">
                  Failed to query Git status. Please make sure to **restart the MorphFinder application** so the new main process IPC channels are registered.
                </p>
                <p className="text-[10px] text-current/40 mt-2 font-mono break-all bg-black/5 dark:bg-white/5 p-1.5 rounded">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="w-full text-xs"
              >
                Retry Query
              </Button>
            </div>
          ) : gitStatus === null ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-current/45">
              <RefreshCw size={24} className="mb-2 animate-spin text-shell-accent" />
              <span className="text-xs">Loading Git status...</span>
            </div>
          ) : !gitStatus.isInstalled ? (
            /* Git is not installed */
            <div className="rounded-shell border border-red-500/20 bg-red-500/10 p-4 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-red-500" />
              <div>
                <h4 className="font-bold text-sm text-red-500">Git Not Installed</h4>
                <p className="text-xs text-current/60 mt-1">
                  We couldn't detect a local Git installation. Please install Git and make sure it is in your system PATH to run Git Radar.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="w-full text-xs"
              >
                Retry Detection
              </Button>
            </div>
          ) : !gitStatus.isRepo ? (
            /* Not a Git repository */
            <div className="rounded-shell border border-shell-border bg-shell-sidebar/20 p-4 text-center space-y-3">
              <Info size={32} className="mx-auto text-current/40" />
              <div>
                <h4 className="font-bold text-sm">Not a Git Repo</h4>
                <p className="text-xs text-current/60 mt-1">
                  This directory is not inside a Git repository.
                </p>
              </div>
              <p className="text-[10px] text-current/40 italic">
                Initialize Git in this directory to view status badges and commit logs.
              </p>
            </div>
          ) : (
            /* Git repository content */
            <>
              {/* Branch status card */}
              <div className="rounded-shell border border-shell-border bg-shell-sidebar/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-shell-accent" />
                  <span className="font-semibold text-sm">{gitStatus.branch}</span>
                </div>
                <div className="border-t border-shell-border/60 my-2" />
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-shell-sidebar border border-shell-border rounded p-1.5">
                    <div className="text-[10px] text-current/40">Staged</div>
                    <div className="font-semibold text-green-500">{addedCount + StagedCount(gitStatus)}</div>
                  </div>
                  <div className="bg-shell-sidebar border border-shell-border rounded p-1.5">
                    <div className="text-[10px] text-current/40">Modified</div>
                    <div className="font-semibold text-amber-500">{modifiedCount - StagedCount(gitStatus)}</div>
                  </div>
                  <div className="bg-shell-sidebar border border-shell-border rounded p-1.5">
                    <div className="text-[10px] text-current/40">Untracked</div>
                    <div className="font-semibold text-blue-500">{untrackedCount}</div>
                  </div>
                </div>
                {totalChanges === 0 ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-green-500 mt-2 bg-green-500/5 border border-green-500/10 rounded px-2 py-1">
                    <CheckCircle size={10} />
                    <span>Working directory is clean</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 mt-2 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1">
                    <FileText size={10} />
                    <span>{totalChanges} files changed</span>
                  </div>
                )}
              </div>

              {/* Commit history */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-current/50 uppercase tracking-wider pl-1">
                  Commit History
                </h4>
                <CommitList commits={gitHistory} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StagedCount(status: GitStatus): number {
  return Object.values(status.statusMap).filter((s) => s === 'staged').length;
}
