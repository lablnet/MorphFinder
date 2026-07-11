import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import { useSpaceAnalyzer } from '@renderer/hooks';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TreemapView } from './components/TreemapView';
import { ListView } from './components/ListView';
import { LoadingState } from './components/LoadingState';
import { ShieldAlert, RefreshCw, FolderClosed } from 'lucide-react';
import { Button } from '../ui/Button';

// Helper to look up a node recursively by path in the tree
function findNodeInTree(node: any, path: string): any | null {
  if (node.path === path) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, path);
      if (found) return found;
    }
  }
  return null;
}

export function SpaceAnalyzer(): React.JSX.Element {
  const { wellKnownDirs } = useAppStore(
    useShallow((state) => ({
      wellKnownDirs: state.wellKnownDirs,
    }))
  );

  const {
    currentPathInput,
    setCurrentPathInput,
    viewedPath,
    isScanning,
    scanResult,
    currentSubTree,
    viewMode,
    hoveredPath,
    scanError,
    setHoveredPath,
    triggerScan,
    cancelScan,
    drillDown,
    toggleViewMode,
    browseFolder,
    progress,
    diskTotal,
    diskFree,
  } = useSpaceAnalyzer();

  const hoveredNode = React.useMemo(() => {
    if (!scanResult || !hoveredPath) return null;
    return findNodeInTree(scanResult, hoveredPath);
  }, [scanResult, hoveredPath]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm relative select-none">
      {/* Header section with search bar and breadcrumbs */}
      <Header
        currentPathInput={currentPathInput}
        setCurrentPathInput={setCurrentPathInput}
        viewedPath={viewedPath}
        isScanning={isScanning}
        viewMode={viewMode}
        onTriggerScan={triggerScan}
        onCancelScan={cancelScan}
        onToggleViewMode={toggleViewMode}
        wellKnownDirs={wellKnownDirs}
        browseFolder={browseFolder}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 relative">
        {isScanning ? (
          <LoadingState progress={progress} />
        ) : scanError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-current/65" role="alert">
            <ShieldAlert size={28} className="text-red-500 animate-pulse" />
            <strong className="text-current text-base">Directory Scan Failed</strong>
            <p className="max-w-lg text-xs leading-relaxed opacity-85">{scanError}</p>
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => void triggerScan()} variant="outline" className="flex items-center gap-1.5 py-1 px-3.5">
                <RefreshCw size={12} />
                <span>Retry Scan</span>
              </Button>
            </div>
          </div>
        ) : !scanResult ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-current/50 py-12">
            <FolderClosed size={36} className="text-current/30" />
            <span className="font-semibold text-current/80">No scan active</span>
            <span className="text-xs max-w-sm text-center">Type or select a path above, then click Scan Space to inspect directory sizing.</span>
            <Button onClick={() => void triggerScan()} variant="accent" className="mt-2 text-xs font-semibold py-1 px-4">
              Scan Default Path
            </Button>
          </div>
        ) : currentSubTree ? (
          viewMode === 'treemap' ? (
            <TreemapView
              children={currentSubTree.children ?? []}
              totalSize={currentSubTree.size}
              onDrillDown={drillDown}
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            />
          ) : (
            <ListView
              children={currentSubTree.children ?? []}
              totalSize={currentSubTree.size}
              onDrillDown={drillDown}
              hoveredPath={hoveredPath}
              setHoveredPath={setHoveredPath}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-current/40">
            Selected directory location not found in scanned data.
          </div>
        )}
      </div>

      {/* Footer bar for statistics summaries */}
      <Footer
        scanResult={scanResult}
        hoveredNode={hoveredNode}
        diskTotal={diskTotal}
        diskFree={diskFree}
      />
    </div>
  );
}
export default SpaceAnalyzer;
