import { AlertCircle, HardDrive, LockKeyhole, FolderPlus } from 'lucide-react';
import { FileContextMenu } from '@renderer/components/files/FileContextMenu';
import { FileView } from '@renderer/components/files/FileView';
import { FileViewer } from '@renderer/components/fileviewer';
import { TabStrip } from '@renderer/components/navigation/TabStrip';
import { ShellLayout } from '@renderer/layouts/ShellLayout';
import { ipc } from '@renderer/services/ipc';
import { useKeyboardShortcuts, useFileSystemController } from '@renderer/hooks';
import { FileToolbar } from '@renderer/components/navigation/FileToolbar';
import { NamePromptDialog } from '@renderer/components/ui/NamePromptDialog';
import { Button } from '@renderer/components/ui/Button';

export function App(): React.JSX.Element {
  useKeyboardShortcuts();

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

  return (
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
        />
      </ShellLayout.PathArea>
      <ShellLayout.Content>
        {tabs.activeId === null ? (
          <div className="flex h-full items-center justify-center">
            <Button onClick={tabs.openHome} variant="accent">
              Open Home
            </Button>
          </div>
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
          />
        )}
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
        <div className="flex h-full items-center px-4 text-xs text-current/55">
          {statusText}
        </div>
      </ShellLayout.StatusArea>
    </ShellLayout>
  );
}
