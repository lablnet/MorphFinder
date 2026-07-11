import { AlertCircle, HardDrive, LockKeyhole, FolderPlus, Terminal as TerminalIcon } from 'lucide-react';
import { FileContextMenu } from '@renderer/components/files/FileContextMenu';
import { FileView } from '@renderer/components/files/FileView';
import { FileViewer } from '@renderer/components/fileviewer';
import { TabStrip } from '@renderer/components/navigation/TabStrip';
import { ShellLayout } from '@renderer/layouts/ShellLayout';
import { ipc } from '@renderer/services/ipc';
import { FileToolbar } from '@renderer/components/navigation/FileToolbar';
import { NamePromptDialog } from '@renderer/components/ui/NamePromptDialog';
import { Button } from '@renderer/components/ui/Button';
import { CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH } from '@shared/constants';
import { CacheCleaner } from '@renderer/components/cachecleaner/CacheCleaner';
import { SpaceAnalyzer } from '@renderer/components/spaceanalyzer';
import { CommandPalette } from '@renderer/components/navigation/CommandPalette';
import { useKeyboardShortcuts, useFileSystemController, useGitRadar } from '@renderer/hooks';
import { GitRadar } from '@renderer/components/gitradar/GitRadar';
import { GitDrawer } from '@renderer/components/gitradar/components/GitDrawer';
import { TerminalPanel } from '@renderer/components/terminal/TerminalPanel';
import { useAppStore } from '@renderer/store';
import { cn } from '@lablnet/ui';



export function App(): React.JSX.Element {
  useKeyboardShortcuts();

  const terminalOpen = useAppStore((state) => state.terminalOpen);
  const toggleTerminal = useAppStore((state) => state.toggleTerminal);

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
  } = useFileSystemController();

  const gitRadar = useGitRadar(tabs.activePath);

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
            <div className="flex-1 min-h-0 relative bg-transparent">
              {tabs.activeId === null ? (
                <div className="flex h-full items-center justify-center">
                  <Button onClick={tabs.openHome} variant="accent">
                    Open Home
                  </Button>
                </div>
              ) : tabs.activePath === CACHE_CLEANER_PATH ? (
                <CacheCleaner />
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
              ) : !fs.isLoading && fs.nodes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-current/50">
                  <FolderPlus size={28} />
                  <span>This folder is empty</span>
                  {!isVirtualLocation ? <Button onClick={() => void createFolder()} variant="outline">New Folder</Button> : null}
                </div>
              ) : (
                <FileView
                  viewMode={viewMode}
                  nodes={fs.nodes}
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
    </>
  );
}
