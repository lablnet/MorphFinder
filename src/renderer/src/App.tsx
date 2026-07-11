import { AlertCircle, HardDrive, LockKeyhole, FolderPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileContextMenu, type FileContextAction, type FileContextMenuState } from '@renderer/components/files/FileContextMenu';
import { FileView } from '@renderer/components/files/FileView';
import { nextSelectionForKeyboard, type SelectionNavigationKey } from '@renderer/components/files/selection';
import { TabStrip } from '@renderer/components/navigation/TabStrip';
import { ShellLayout } from '@renderer/layouts/ShellLayout';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';
import {
  useFileSystem,
  useFileOperations,
  useKeyboardShortcuts,
  useLayoutShell,
  useSelection,
  useTabs,
  useTheme,
} from '@renderer/hooks';
import { useAppStore } from '@renderer/store';
import { THIS_PC_PATH } from '@shared/constants';
import { FileToolbar } from '@renderer/components/navigation/FileToolbar';
import { NamePromptDialog } from '@renderer/components/ui/NamePromptDialog';
import { Button } from '@renderer/components/ui/Button';

type ClipboardState = { kind: 'copy' | 'cut'; paths: string[] } | null;
type RenameDraft = { node: FileSystemNode; value: string; error: string | null } | null;

interface AppNamePromptState {
  title: string;
  defaultValue: string;
  value: string;
  resolve: (value: string | null) => void;
}

const SELECTION_KEYS = new Set<string>(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

function isPrimaryModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

function copyNameSuggestion(name: string): string {
  return name.startsWith('copy_') ? name : `copy_${name}`;
}

export function App(): React.JSX.Element {
  useKeyboardShortcuts();

  const tabs = useTabs();
  const fs = useFileSystem();
  const selection = useSelection();
  const operations = useFileOperations();
  const layoutShell = useLayoutShell();
  const theme = useTheme();
  const activeTab = useAppStore((state) => state.activeTab());
  const setActiveTabViewMode = useAppStore((state) => state.setActiveTabViewMode);
  const [clipboard, setClipboard] = useState<ClipboardState>(null);
  const [contextMenu, setContextMenu] = useState<FileContextMenuState | null>(null);
  const [contextNode, setContextNode] = useState<FileSystemNode | null>(null);
  const [contextTargets, setContextTargets] = useState<FileSystemNode[]>([]);
  const [renameDraft, setRenameDraft] = useState<RenameDraft>(null);
  const [namePrompt, setNamePrompt] = useState<AppNamePromptState | null>(null);

  const viewMode = activeTab?.viewMode ?? 'list';
  const isVirtualLocation = tabs.activePath === THIS_PC_PATH;
  const selectedNodes = useMemo(
    () => fs.nodes.filter((node) => selection.selectedSet.has(node.path)),
    [fs.nodes, selection.selectedSet],
  );
  const handleSelectionChange = useCallback((paths: string[], anchorPath?: string): void => {
    if (paths.length === 0) selection.clear();
    else selection.set(paths, anchorPath);
  }, [selection]);

  const askForName = useCallback((title: string, defaultValue: string): Promise<string | null> => (
    new Promise((resolve) => setNamePrompt({ title, defaultValue, value: defaultValue, resolve }))
  ), []);

  const closeNamePrompt = useCallback((value: string | null): void => {
    setNamePrompt((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const renameNode = useCallback(async (node: FileSystemNode): Promise<void> => {
    setRenameDraft({ node, value: node.name, error: null });
  }, []);

  const commitRename = useCallback((): void => {
    const draft = renameDraft;
    if (draft === null) return;

    const nextName = draft.value.trim();
    if (nextName.length === 0 || nextName === draft.node.name) {
      setRenameDraft(null);
      return;
    }

    const nameAlreadyExists = fs.nodes.some((node) => (
      node.path !== draft.node.path &&
      node.name.localeCompare(nextName, undefined, { sensitivity: 'accent' }) === 0
    ));
    if (nameAlreadyExists) {
      setRenameDraft({
        node: draft.node,
        value: copyNameSuggestion(nextName),
        error: 'Name already in use.',
      });
      return;
    }

    void ipc.invoke('fs:rename', { path: draft.node.path, newName: nextName })
      .then(() => {
        setRenameDraft(null);
        fs.refresh();
      })
      .catch((cause) => {
        const message = cause instanceof Error ? cause.message : String(cause);
        const isNameConflict = message.toLowerCase().includes('already exists');
        setRenameDraft({
          node: draft.node,
          value: isNameConflict ? copyNameSuggestion(nextName) : nextName,
          error: isNameConflict ? 'Name already in use.' : message,
        });
      });
  }, [fs, renameDraft]);

  const cancelRename = useCallback((): void => {
    setRenameDraft(null);
  }, []);

  const createFolder = async (): Promise<void> => {
    if (tabs.activePath.length === 0 || isVirtualLocation) return;
    const name = (await askForName('New Folder', 'Untitled Folder'))?.trim();
    if (name === undefined || name.length === 0) return;
    await ipc.invoke('fs:createFolder', { parentPath: tabs.activePath, name });
    fs.refresh();
  };

  const destinationForPaste = useCallback(
    (node: FileSystemNode | null): string | null => {
      if (node?.kind === 'directory') return node.path;
      if (tabs.activePath.length === 0 || isVirtualLocation) return null;
      return tabs.activePath;
    },
    [isVirtualLocation, tabs.activePath],
  );

  const pasteClipboard = useCallback(
    async (node: FileSystemNode | null): Promise<void> => {
      const destination = destinationForPaste(node);
      if (clipboard === null || destination === null) return;
      if (clipboard.kind === 'copy') await operations.copyTo(clipboard.paths, destination);
      else {
        await operations.moveTo(clipboard.paths, destination);
        setClipboard(null);
      }
      fs.refresh();
    },
    [clipboard, destinationForPaste, fs, operations],
  );

  const moveDroppedPaths = useCallback(
    async (paths: string[], destinationDir: string): Promise<void> => {
      await operations.moveTo(paths, destinationDir);
      fs.refresh();
    },
    [fs, operations],
  );

  const openContextMenu = (node: FileSystemNode | null, event: React.MouseEvent): void => {
    event.preventDefault();
    const targets = node === null
      ? selectedNodes
      : selection.selectedSet.has(node.path)
        ? selectedNodes
        : [node];
    setContextNode(node);
    setContextTargets(targets);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      hasTarget: node !== null,
      canPaste: clipboard !== null && destinationForPaste(node) !== null,
    });
  };

  const runContextAction = (action: FileContextAction): void => {
    const primaryNode = contextNode ?? contextTargets[0] ?? null;
    setContextMenu(null);

    if (action === 'open' && primaryNode !== null) fs.openNode(primaryNode);
    if (action === 'rename' && primaryNode !== null) void renameNode(primaryNode);
    if (action === 'copy' && contextTargets.length > 0) setClipboard({ kind: 'copy', paths: contextTargets.map((node) => node.path) });
    if (action === 'cut' && contextTargets.length > 0) setClipboard({ kind: 'cut', paths: contextTargets.map((node) => node.path) });
    if (action === 'paste') void pasteClipboard(contextNode);
    if (action === 'trash' && contextTargets.length > 0) {
      void operations.trash(contextTargets.map((node) => node.path)).then(fs.refresh);
    }
    if (action === 'new-folder') void createFolder();
    if (action === 'show-in-folder' && primaryNode !== null) void ipc.invoke('shell:showInFolder', { path: primaryNode.path });
    if (action === 'refresh') fs.refresh();
  };

  useEffect(() => {
    if (layoutShell.shell.id === 'explorer' && tabs.activePath === '/') {
      fs.navigate(THIS_PC_PATH);
    }
  }, [fs, layoutShell.shell.id, tabs.activePath]);

  useEffect(() => {
    function handleFileKeys(event: KeyboardEvent): void {
      if (renameDraft !== null) return;
      const selected = fs.nodes.find((node) => node.path === selection.selectedPaths[0]);
      if (event.key === 'F2' && selected !== undefined) {
        event.preventDefault();
        void renameNode(selected);
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection.selectedPaths.length > 0) {
        event.preventDefault();
        void operations.trash(selection.selectedPaths).then(fs.refresh);
      }
      if (event.key === 'Enter' && selected !== undefined) {
        event.preventDefault();
        fs.openNode(selected);
      }
      if (SELECTION_KEYS.has(event.key)) {
        event.preventDefault();
        const result = nextSelectionForKeyboard(fs.nodes, selection.selectedPaths, event.key as SelectionNavigationKey, {
          extend: event.shiftKey,
          columns: viewMode === 'icons' || viewMode === 'gallery' ? 4 : 1,
        });
        handleSelectionChange(result.paths, result.anchorPath);
      }
      if (isPrimaryModifier(event) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        handleSelectionChange(fs.nodes.map((node) => node.path), fs.nodes[0]?.path);
      }
      if (isPrimaryModifier(event) && event.key.toLowerCase() === 'c' && selection.selectedPaths.length > 0) {
        event.preventDefault();
        setClipboard({ kind: 'copy', paths: selection.selectedPaths });
      }
      if (isPrimaryModifier(event) && event.key.toLowerCase() === 'x' && selection.selectedPaths.length > 0) {
        event.preventDefault();
        setClipboard({ kind: 'cut', paths: selection.selectedPaths });
      }
      if (isPrimaryModifier(event) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        void pasteClipboard(null);
      }
    }

    window.addEventListener('keydown', handleFileKeys);
    return () => window.removeEventListener('keydown', handleFileKeys);
  }, [fs, handleSelectionChange, operations, pasteClipboard, renameDraft, renameNode, selection.selectedPaths, viewMode]);

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
            onRenameValueChange={(value) => setRenameDraft((current) => (current === null ? null : { ...current, value, error: null }))}
            onCommitRename={commitRename}
            onCancelRename={cancelRename}
            dropDestinationPath={isVirtualLocation ? null : tabs.activePath}
            onMove={(paths, destinationDir) => void moveDroppedPaths(paths, destinationDir)}
            onExternalDrag={(paths) => void ipc.invoke('shell:startDrag', { paths })}
          />
        )}
        {contextMenu !== null ? (
          <FileContextMenu state={contextMenu} onAction={runContextAction} onClose={() => setContextMenu(null)} />
        ) : null}
        {namePrompt !== null ? (
          <NamePromptDialog
            prompt={namePrompt}
            onChange={(value) => setNamePrompt((current) => (current === null ? null : { ...current, value }))}
            onConfirm={closeNamePrompt}
            onCancel={() => closeNamePrompt(null)}
          />
        ) : null}
      </ShellLayout.Content>
      <ShellLayout.StatusArea>
        <div className="flex h-full items-center px-4 text-xs text-current/55">
          {fs.isLoading
            ? 'Loading...'
            : renameDraft?.error !== null && renameDraft?.error !== undefined
              ? renameDraft.error
              : fs.error !== null
                ? fs.error
                : `${fs.nodes.length} item${fs.nodes.length === 1 ? '' : 's'}${selection.selectedPaths.length > 0 ? `, ${selection.selectedPaths.length} selected` : ''}`}
        </div>
      </ShellLayout.StatusArea>
    </ShellLayout>
  );
}
