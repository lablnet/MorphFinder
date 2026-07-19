import { useEffect, useRef, useMemo } from 'react';
import { AlertCircle, HardDrive, Loader2, LockKeyhole, FolderPlus, Terminal as TerminalIcon } from 'lucide-react';
import { FileContextMenu } from '@renderer/components/files/FileContextMenu';
import { FileView } from '@renderer/components/files/FileView';
import { FileViewer } from '@renderer/components/fileviewer';
import { TabStrip } from '@renderer/components/navigation/TabStrip';
import { ShellLayout } from '@renderer/layouts/ShellLayout';
import { ipc } from '@renderer/services/ipc';
import { FileToolbar } from '@renderer/components/navigation/FileToolbar';
import { NamePromptDialog } from '@renderer/components/ui/NamePromptDialog';
import { Button } from '@renderer/components/ui/Button';
import { AIRSHARE_PATH, CACHE_CLEANER_PATH, DEV_PANEL_PATH, DUPLICATE_FINDER_PATH, FILE_TIMELINE_PATH, SPACE_ANALYZER_PATH } from '@shared/constants';
import { CacheCleaner } from '@renderer/components/cachecleaner/CacheCleaner';
import { SpaceAnalyzer } from '@renderer/components/spaceanalyzer';
import { DevPanel } from '@renderer/components/devpanel/DevPanel';
import { DuplicateFinder } from '@renderer/components/duplicates/DuplicateFinder';
import { FileTimeline } from '@renderer/components/filetimeline/FileTimeline';
import { AirShareHub } from '@renderer/components/airshare/AirShareHub';
import { CommandPalette } from '@renderer/components/navigation/CommandPalette';
import { useKeyboardShortcuts, useFileSystemController, useGitRadar, useProjectDetector, useOnboarding } from '@renderer/hooks';
import { OnboardingModal } from '@renderer/components/onboarding/OnboardingModal';
import { DevPanelStatusButton } from '@renderer/components/devpanel/components/DevPanelStatusButton';

import { GitRadar } from '@renderer/components/gitradar/GitRadar';
import { GitDrawer } from '@renderer/components/gitradar/components/GitDrawer';
import { TerminalPanel } from '@renderer/components/terminal/TerminalPanel';
import { DetailsPanel } from '@renderer/components/files/DetailsPanel';
import { WorkspaceSnapshotsModal } from '@renderer/components/snapshots/WorkspaceSnapshotsModal';
import { OperationProgressContainer } from '@renderer/components/files/OperationProgressContainer';
import { WebShareModal } from '@renderer/components/webshare/WebShareModal';
import { useAppStore } from '@renderer/store';
import { cn } from '@lablnet/ui';



export function App(): React.JSX.Element {
  useKeyboardShortcuts();
  const onboarding = useOnboarding();

  const terminalOpen = useAppStore((state) => state.terminalOpen);
  const toggleTerminal = useAppStore((state) => state.toggleTerminal);
  
  const detailsNode = useAppStore((state) => state.detailsNode);
  const closeDetails = useAppStore((state) => state.closeDetails);
  const activeTagFilter = useAppStore((state) => state.activeTagFilter);
  const annotations = useAppStore((state) => state.annotations);

  const {
    tabs,
    fs,
    selection,
    operations,
    layoutShell,
    theme,
    viewMode,
    isVirtualLocation,
    renameDraft,
    namePrompt,
    contextMenu,
    webShareTargets,
    statusText,
    onNamePromptChange,
    closeNamePrompt,
    createFolder,
    openContextMenu,
    runContextAction,
    handleSelectionChange,
    renameNode,
    commitRename,
    cancelRename,
    moveDroppedPaths,
    setActiveTabViewMode,
    onRenameValueChange,
    closeContextMenu,
    closeWebShare,
  } = useFileSystemController();

  const filteredNodes = useMemo(() => {
    if (!activeTagFilter) return fs.nodes;
    return fs.nodes.filter((node) => {
      const ann = annotations[node.path];
      return ann?.tags.some((t) => t.label === activeTagFilter);
    });
  }, [fs.nodes, activeTagFilter, annotations]);

  const gitRadar = useGitRadar(tabs.activePath);
  const projectDetector = useProjectDetector(isVirtualLocation ? null : tabs.activePath);
  const lastRealPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (tabs.activePath !== null && !isVirtualLocation) {
      lastRealPathRef.current = tabs.activePath;
    }
  }, [isVirtualLocation, tabs.activePath]);

  const tabsOpenRef = useRef(tabs.open);
  tabsOpenRef.current = tabs.open;
  const openedInitialPathRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPath = params.get('initialPath');
    if (initialPath && !openedInitialPathRef.current) {
      openedInitialPathRef.current = true;
      tabsOpenRef.current(initialPath);
    }
  }, []);

  return (
    <>
      <ShellLayout>
        <ShellLayout.TabArea>
          <TabStrip
            tabs={tabs.all}
            activeTabId={tabs.activeId}
            onActivate={tabs.activate}
            onClose={tabs.close}
            onNew={tabs.openHome}
            onReorder={tabs.reorder}
          />
        </ShellLayout.TabArea>
        <ShellLayout.PathArea>
          <FileToolbar
            shellId={layoutShell.shell.id}
            setShell={layoutShell.setShell}
            activePath={tabs.activePath}
            navigate={fs.navigate}
            canGoBack={tabs.canGoBack}
            canGoForward={tabs.canGoForward}
            onBack={tabs.back}
            onForward={tabs.forward}
            themeMode={theme.mode}
            onThemeChange={theme.setMode}
            isVirtualLocation={isVirtualLocation}
            onCreateFolder={() => void createFolder()}
            selectedPathsCount={selection.selectedPaths.length}
            onTrashSelected={() => void operations.trash(selection.selectedPaths).then(fs.refresh)}
            viewMode={viewMode}
            onViewModeChange={(mode) => setActiveTabViewMode(mode)}
            onRefresh={fs.refresh}
            gitRadarNode={
              <GitRadar
                activePath={tabs.activePath ?? ''}
                activeShell={layoutShell.shell.id}
                gitStatus={gitRadar.gitStatus}
                isOpen={gitRadar.isOpen}
                toggleOpen={gitRadar.toggleOpen}
              />
            }
          />
        </ShellLayout.PathArea>
        <ShellLayout.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 bg-transparent">
              <div className="relative min-w-0 flex-1">
              {tabs.activeId === null ? (
                <div className="flex h-full items-center justify-center">
                  <Button onClick={tabs.openHome} variant="accent">
                    Open Home
                  </Button>
                </div>
              ) : tabs.activePath === AIRSHARE_PATH ? (
                <AirShareHub />
              ) : tabs.activePath === CACHE_CLEANER_PATH ? (
                <CacheCleaner />
              ) : tabs.activePath === DEV_PANEL_PATH ? (
                <DevPanel />
              ) : tabs.activePath === DUPLICATE_FINDER_PATH ? (
                <DuplicateFinder />
              ) : tabs.activePath === FILE_TIMELINE_PATH ? (
                <FileTimeline initialRootPath={lastRealPathRef.current} onOpenPath={(path) => void ipc.invoke('shell:showInFolder', { path })} />
              ) : tabs.activePath === SPACE_ANALYZER_PATH ? (
                <SpaceAnalyzer />
              ) : fs.error !== null ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-current/65" role="alert">
                  {fs.errorKind === 'permission' ? <LockKeyhole size={28} /> : fs.errorKind === 'unavailable' ? <HardDrive size={28} /> : <AlertCircle size={28} />}
                  <strong className="text-current">
                    {fs.errorKind === 'permission' ? 'Permission denied' : fs.errorKind === 'unavailable' ? 'Location unavailable' : 'Could not open this location'}
                  </strong>
                  <span className="max-w-lg">{fs.errorKind === 'unavailable' ? 'The volume may have been ejected or disconnected.' : fs.error}</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={fs.refresh} variant="outline">Retry</Button>
                    <Button onClick={tabs.openHome} variant="accent">Open Home</Button>
                  </div>
                </div>
              ) : fs.isLoading && fs.nodes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-current/55">
                  <Loader2 size={28} className="animate-spin text-shell-accent" />
                  <strong className="text-current">Scanning...</strong>
                  <span className="max-w-md">Collecting files for this location.</span>
                </div>
              ) : filteredNodes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-current/50">
                  <FolderPlus size={28} />
                  <span>{fs.nodes.length === 0 ? 'This folder is empty' : 'No items match the selected tag filter'}</span>
                  {fs.nodes.length === 0 && !isVirtualLocation ? <Button onClick={() => void createFolder()} variant="outline">New Folder</Button> : null}
                </div>
              ) : (
                <FileView
                  viewMode={viewMode}
                  nodes={filteredNodes}
                  selectedPaths={selection.selectedSet}
                  density="comfortable"
                  onOpen={fs.openNode}
                  onSelectionChange={handleSelectionChange}
                  onContextMenu={openContextMenu}
                  onStartRename={(node) => void renameNode(node)}
                  renamingPath={renameDraft?.node.path ?? null}
                  renamingValue={renameDraft?.value ?? ''}
                  renamingError={renameDraft?.error ?? null}
                  onRenameValueChange={onRenameValueChange}
                  onCommitRename={commitRename}
                  onCancelRename={cancelRename}
                  dropDestinationPath={isVirtualLocation ? null : tabs.activePath}
                  onMove={(paths, destinationDir) => void moveDroppedPaths(paths, destinationDir)}
                  onExternalDrag={(paths) => void ipc.invoke('shell:startDrag', { paths })}
                  gitStatusMap={gitRadar.gitStatus?.statusMap}
                />
              )}
              </div>
              {fs.error === null && tabs.activeId !== null && detailsNode !== null ? (
                <DetailsPanel node={detailsNode} onClose={closeDetails} />
              ) : null}
            </div>
            <TerminalPanel />
          </div>
          {contextMenu !== null ? (
            <FileContextMenu state={contextMenu} onAction={runContextAction} onClose={closeContextMenu} />
          ) : null}
          {namePrompt !== null ? (
            <NamePromptDialog
              prompt={namePrompt}
              onChange={onNamePromptChange}
              onConfirm={closeNamePrompt}
              onCancel={() => closeNamePrompt(null)}
            />
          ) : null}
          {fs.fileViewerTarget !== null ? (
            <FileViewer
              node={fs.fileViewerTarget}
              onClose={fs.closeFileViewer}
            />
          ) : null}
        </ShellLayout.Content>
        <ShellLayout.StatusArea>
          <div className="flex h-full w-full items-center justify-between px-4 text-xs text-current/55">
            <div>{statusText}</div>
            <DevPanelStatusButton
              hasProject={projectDetector.hasProject}
              projectType={projectDetector.projectType}
              projectName={projectDetector.projectName}
              onClick={() => fs.navigate(DEV_PANEL_PATH)}
            />
            <button
              onClick={toggleTerminal}
              className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-shell-surface/60 transition-colors select-none cursor-pointer',
                terminalOpen && 'bg-shell-accent/15 text-shell-accent'
              )}
              title="Toggle Console Shell (Ctrl+`)"
            >
              <TerminalIcon size={12} />
              <span>Terminal</span>
            </button>
          </div>
        </ShellLayout.StatusArea>
      </ShellLayout>
      <CommandPalette
        currentNodes={fs.nodes}
        onOpenNode={fs.openNode}
        onCreateFolder={() => void createFolder()}
        onRefresh={fs.refresh}
        onOpenOnboarding={onboarding.openOnboarding}
      />
      <GitDrawer
        isOpen={gitRadar.isOpen}
        onClose={gitRadar.toggleOpen}
        gitStatus={gitRadar.gitStatus}
        gitHistory={gitRadar.gitHistory}
        isLoading={gitRadar.isLoading}
        onRefresh={gitRadar.refresh}
        error={gitRadar.error}
      />
      <WorkspaceSnapshotsModal />
      <OperationProgressContainer />
      <OnboardingModal
        isOpen={onboarding.isOpen}
        onClose={onboarding.closeOnboarding}
      />
      <WebShareModal
        isOpen={Boolean(webShareTargets && webShareTargets.length > 0)}
        targetPath={webShareTargets}
        onClose={closeWebShare}
      />
    </>
  );
}
