import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@renderer/store';
import { useSpaceAnalyzer } from '@renderer/hooks';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TreemapView } from './components/TreemapView';
import { ListView } from './components/ListView';
import { DonutView } from './components/DonutView';
import { InspectorView } from './components/InspectorView';
import { LoadingState } from './components/LoadingState';
import { FolderPickerDialog } from '@renderer/components/folderpicker/FolderPickerDialog';
import { ShieldAlert, RefreshCw, FolderClosed } from 'lucide-react';
import { Button } from '../ui/Button';

import type { SpaceAnalyzerNode } from '@shared/types/spaceAnalyzer';

// Helper to look up a node recursively by path in the tree
function findNodeInTree(node: SpaceAnalyzerNode, path: string): SpaceAnalyzerNode | null {
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
  const [isFolderPickerOpen, setIsFolderPickerOpen] = React.useState(false);
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
    setViewMode,
    hoveredPath,
    scanError,
    setHoveredPath,
    triggerScan,
    cancelScan,
    drillDown,
    progress,
    diskTotal,
    diskFree,
    selectedPath,
    setSelectedPath,
    history,
    navigateUp,
  } = useSpaceAnalyzer();

  const hoveredNode = React.useMemo(() => {
    if (!scanResult || !hoveredPath) return null;
    return findNodeInTree(scanResult, hoveredPath);
  }, [scanResult, hoveredPath]);

  const selectedNode = React.useMemo(() => {
    if (!scanResult || !selectedPath) return null;
    return findNodeInTree(scanResult, selectedPath);
  }, [scanResult, selectedPath]);

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
        onChangeViewMode={setViewMode}
        wellKnownDirs={wellKnownDirs}
        browseFolder={() => {
          setIsFolderPickerOpen(true);
          return Promise.resolve();
        }}
        history={history}
        onNavigateUp={navigateUp}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4 min-h-0 relative">
        <div className="flex-1 min-h-0 relative overflow-hidden">
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
                selectedPath={selectedPath}
                onSelectNode={setSelectedPath}
              />
            ) : viewMode === 'donut' ? (
              <DonutView
                children={currentSubTree.children ?? []}
                totalSize={currentSubTree.size}
                onDrillDown={drillDown}
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
                selectedPath={selectedPath}
                onSelectNode={setSelectedPath}
              />
            ) : (
              <ListView
                children={currentSubTree.children ?? []}
                totalSize={currentSubTree.size}
                onDrillDown={drillDown}
                hoveredPath={hoveredPath}
                setHoveredPath={setHoveredPath}
                selectedPath={selectedPath}
                onSelectNode={setSelectedPath}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-current/40">
              Selected directory location not found in scanned data.
            </div>
          )}
        </div>

        {/* Bottom Selection Inspector */}
        {!isScanning && selectedNode && (
          <InspectorView
            node={selectedNode}
            onClose={() => setSelectedPath(null)}
            onDrillDown={drillDown}
          />
        )}
      </div>

      {/* Footer bar for statistics summaries */}
      <Footer
        scanResult={scanResult}
        hoveredNode={hoveredNode}
        diskTotal={diskTotal}
        diskFree={diskFree}
      />
      {isFolderPickerOpen ? (
        <FolderPickerDialog
          title="Choose Space Analyzer Folder"
          initialPath={currentPathInput}
          onClose={() => setIsFolderPickerOpen(false)}
          onChoose={(path) => {
            setIsFolderPickerOpen(false);
            setCurrentPathInput(path);
          }}
        />
      ) : null}
    </div>
  );
}
export default SpaceAnalyzer;
