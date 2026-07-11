import React from 'react';
import {
  RefreshCw,
  LayoutGrid,
  List,
  Home,
  Monitor,
  Download,
  FileText,
  FolderOpen,
  Square,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface HeaderProps {
  currentPathInput: string;
  setCurrentPathInput: (path: string) => void;
  viewedPath: string;
  isScanning: boolean;
  viewMode: 'treemap' | 'list';
  onTriggerScan: (path?: string) => Promise<void>;
  onCancelScan: () => Promise<void>;
  onToggleViewMode: () => void;
  wellKnownDirs: { home: string; desktop: string; documents: string; downloads: string } | null;
  browseFolder: () => Promise<void>;
}

export function Header({
  currentPathInput,
  setCurrentPathInput,
  viewedPath,
  isScanning,
  viewMode,
  onTriggerScan,
  onCancelScan,
  onToggleViewMode,
  wellKnownDirs,
  browseFolder,
}: HeaderProps): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isScanning) {
      void onTriggerScan();
    }
  };

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-shell-border p-4 bg-shell-surface/60 backdrop-blur-md">
      {/* Top Title & Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-current select-none leading-none mb-1">
              Storage Analyzer
            </h2>
            <p className="text-[10px] sm:text-xs text-current/50 select-none">
              Explore which files and sub-folders consume disk space.
            </p>
          </div>
        </div>

        {/* View mode toggle & reload */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onToggleViewMode}
            variant="outline"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs"
            title={viewMode === 'treemap' ? 'Switch to List view' : 'Switch to Treemap view'}
          >
            {viewMode === 'treemap' ? <List size={13} /> : <LayoutGrid size={13} />}
            <span className="hidden sm:inline select-none">
              {viewMode === 'treemap' ? 'List View' : 'Treemap View'}
            </span>
          </Button>
          <Button
            onClick={() => void onTriggerScan()}
            disabled={isScanning}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-current/80"
            title="Rescan current folder"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Input controls and presets */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Input area */}
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={currentPathInput}
            onChange={(e) => setCurrentPathInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type absolute folder path to scan..."
            className="flex-1 text-xs h-8 text-current border-shell-border"
            style={{
              backgroundColor: 'var(--shell-sidebar)',
              color: 'currentColor',
            }}
          />
          <Button
            onClick={() => void browseFolder()}
            disabled={isScanning}
            variant="outline"
            className="h-8 text-xs font-semibold px-3 shrink-0 flex items-center gap-1"
          >
            <FolderOpen size={12} />
            <span>Browse...</span>
          </Button>

          {isScanning ? (
            <Button
              onClick={() => void onCancelScan()}
              variant="outline"
              className="h-8 text-xs font-semibold px-4 shrink-0 flex items-center gap-1.5 border-red-500/40 text-red-500 hover:bg-red-500/10 active:bg-red-500/20"
            >
              <Square size={10} className="fill-current" />
              <span>Stop Scan</span>
            </Button>
          ) : (
            <Button
              onClick={() => void onTriggerScan()}
              disabled={!currentPathInput.trim()}
              variant="accent"
              className="h-8 text-xs font-semibold px-4 shrink-0 shadow-sm"
            >
              Scan Space
            </Button>
          )}
        </div>

        {/* Preset quick buttons */}
        {wellKnownDirs && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-current/35 mr-1 select-none hidden lg:inline">
              Presets:
            </span>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded bg-transparent"
              onClick={() => void onTriggerScan(wellKnownDirs.home)}
              disabled={isScanning}
            >
              <Home size={10} />
              Home
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded bg-transparent"
              onClick={() => void onTriggerScan(wellKnownDirs.desktop)}
              disabled={isScanning}
            >
              <Monitor size={10} />
              Desktop
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded bg-transparent"
              onClick={() => void onTriggerScan(wellKnownDirs.documents)}
              disabled={isScanning}
            >
              <FileText size={10} />
              Documents
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded bg-transparent"
              onClick={() => void onTriggerScan(wellKnownDirs.downloads)}
              disabled={isScanning}
            >
              <Download size={10} />
              Downloads
            </Button>
          </div>
        )}
      </div>

      {/* Path Breadcrumb Display */}
      <div className="text-[11px] font-semibold text-current/60 bg-shell-sidebar/30 py-1.5 px-2.5 border border-shell-border/40 rounded-shell select-none flex items-center gap-1.5 min-w-0">
        <span className="text-current/35 select-none shrink-0">Viewing:</span>
        <span className="truncate font-mono text-current/80">{viewedPath}</span>
      </div>
    </div>
  );
}
export default Header;
