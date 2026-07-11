import { AlertCircle, Columns3, FolderPlus, Grid2X2, HardDrive, List, LockKeyhole, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@lablnet/ui';
import { ShellSwitcher } from '@renderer/components/chrome/ShellSwitcher';
import { ThemeToggle } from '@renderer/components/chrome/ThemeToggle';
import { FileContextMenu, type FileContextAction, type FileContextMenuState } from '@renderer/components/files/FileContextMenu';
import { FileView } from '@renderer/components/files/FileView';
import { nextSelectionForKeyboard, type SelectionNavigationKey } from '@renderer/components/files/selection';
import { HistoryButtons } from '@renderer/components/navigation/HistoryButtons';
import { PathBreadcrumb } from '@renderer/components/navigation/PathBreadcrumb';
import { TabStrip } from '@renderer/components/navigation/TabStrip';
import { ShellLayout } from '@renderer/layouts/ShellLayout';
import { ipc } from '@renderer/services/ipc';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { useFileSystem } from '@renderer/hooks/useFileSystem';
import { useFileOperations } from '@renderer/hooks/useFileOperations';
import { useKeyboardShortcuts } from '@renderer/hooks/useKeyboardShortcuts';
import { useLayoutShell } from '@renderer/hooks/useLayoutShell';
import { useSelection } from '@renderer/hooks/useSelection';
import { useTabs } from '@renderer/hooks/useTabs';
import { useTheme } from '@renderer/hooks/useTheme';
import { useAppStore } from '@renderer/store';
import { THIS_PC_PATH } from '@shared/constants';
import type { ViewMode } from '@shared/types/layout';

const VIEW_OPTIONS: Array<{ mode: ViewMode; label: string; Icon: typeof Grid2X2 }> = [
  { mode: 'icons', label: 'Icons', Icon: Grid2X2 },
  { mode: 'list', label: 'List', Icon: List },
  { mode: 'columns', label: 'Columns', Icon: Columns3 },
];

type ClipboardState = { kind: 'copy' | 'cut'; paths: string[] } | null;
type RenameDraft = { node: FileSystemNode; value: string; error: string | null } | null;
type NamePromptState = {
  title: string;
  defaultValue: string;
  value: string;
  resolve: (value: string | null) => void;
} | null;
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
  const [namePrompt, setNamePrompt] = useState<NamePromptState>(null);

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

  const statusText = fs.isLoading
    ? 'Loading...'
    : renameDraft?.error !== null && renameDraft?.error !== undefined
      ? renameDraft.error
      : fs.error !== null
      ? fs.error
      : `${fs.nodes.length} item${fs.nodes.length === 1 ? '' : 's'}${selection.selectedPaths.length > 0 ? `, ${selection.selectedPaths.length} selected` : ''}`;

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
        <div
          className={cn(
            'flex items-center gap-2 px-2',
            layoutShell.shell.id === 'explorer' && 'h-12 border-b border-shell-border bg-[#f9f9f9] px-4 dark:bg-[#202020]',
          )}
        >
          <HistoryButtons
            canGoBack={tabs.canGoBack}
            canGoForward={tabs.canGoForward}
            onBack={tabs.back}
            onForward={tabs.forward}
            variant={layoutShell.shell.id === 'explorer' ? 'explorer' : 'default'}
          />
          <div
            className={cn(
              'min-w-0 flex-1',
              layoutShell.shell.id === 'explorer' && 'rounded border border-shell-border bg-white/80 dark:bg-[#2b2b2b]',
            )}
          >
            <PathBreadcrumb path={tabs.activePath} onNavigate={fs.navigate} />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <ShellSwitcher activeShell={layoutShell.shell.id} onSelect={layoutShell.setShell} />
            <ThemeToggle mode={theme.mode} onChange={theme.setMode} />
            <button
              type="button"
              title="New Folder"
              aria-label="New Folder"
              disabled={isVirtualLocation}
              onClick={() => void createFolder()}
              className={cn(
                'flex h-7 w-7 items-center justify-center text-current/70 disabled:opacity-30',
                layoutShell.shell.id === 'explorer' ? 'rounded hover:bg-black/5 dark:hover:bg-white/5' : 'rounded-shell hover:bg-shell-sidebar',
              )}
            >
              <FolderPlus size={15} />
            </button>
            <button
              type="button"
              title="Move to Trash"
              aria-label="Move to Trash"
              disabled={selection.selectedPaths.length === 0}
              onClick={() => void operations.trash(selection.selectedPaths).then(fs.refresh)}
              className={cn(
                'flex h-7 w-7 items-center justify-center text-current/70 disabled:opacity-30',
                layoutShell.shell.id === 'explorer' ? 'rounded hover:bg-black/5 dark:hover:bg-white/5' : 'rounded-shell hover:bg-shell-sidebar',
              )}
            >
              <Trash2 size={15} />
            </button>
            {VIEW_OPTIONS.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => setActiveTabViewMode(mode)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center text-current/70',
                  layoutShell.shell.id === 'explorer' ? 'rounded hover:bg-black/5 dark:hover:bg-white/5' : 'rounded-shell hover:bg-shell-sidebar',
                  viewMode === mode && (layoutShell.shell.id === 'explorer' ? 'bg-black/10 text-current dark:bg-white/10' : 'bg-shell-sidebar text-current'),
                )}
              >
                <Icon size={15} />
              </button>
            ))}
            <button
              type="button"
              title="Refresh"
              aria-label="Refresh"
              onClick={fs.refresh}
              className={cn(
                'flex h-7 w-7 items-center justify-center text-current/70',
                layoutShell.shell.id === 'explorer' ? 'rounded hover:bg-black/5 dark:hover:bg-white/5' : 'rounded-shell hover:bg-shell-sidebar',
              )}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </ShellLayout.PathArea>
      <ShellLayout.Content>
        {tabs.activeId === null ? (
          <div className="flex h-full items-center justify-center">
            <button type="button" onClick={tabs.openHome} className="rounded-shell bg-[color:var(--shell-accent)] px-3 py-1.5 text-sm font-medium text-white">
              Open Home
            </button>
          </div>
        ) : fs.error !== null ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-current/65" role="alert">
            {fs.errorKind === 'permission' ? <LockKeyhole size={28} /> : fs.errorKind === 'unavailable' ? <HardDrive size={28} /> : <AlertCircle size={28} />}
            <strong className="text-current">
              {fs.errorKind === 'permission' ? 'Permission denied' : fs.errorKind === 'unavailable' ? 'Location unavailable' : 'Could not open this location'}
            </strong>
            <span className="max-w-lg">{fs.errorKind === 'unavailable' ? 'The volume may have been ejected or disconnected.' : fs.error}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={fs.refresh} className="rounded-shell border border-shell-border px-3 py-1.5">Retry</button>
              <button type="button" onClick={tabs.openHome} className="rounded-shell bg-[color:var(--shell-accent)] px-3 py-1.5 text-white">Open Home</button>
            </div>
          </div>
        ) : !fs.isLoading && fs.nodes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-current/50">
            <FolderPlus size={28} />
            <span>This folder is empty</span>
            {!isVirtualLocation ? <button type="button" onClick={() => void createFolder()} className="rounded-shell border border-shell-border px-3 py-1.5 text-current">New Folder</button> : null}
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 px-4" role="presentation" onMouseDown={() => closeNamePrompt(null)}>
            <form
              className="w-full max-w-sm rounded-shell border border-shell-border bg-shell-surface p-4 shadow-xl"
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                closeNamePrompt(namePrompt.value);
              }}
            >
              <label className="block text-sm font-medium text-current" htmlFor="name-prompt-input">{namePrompt.title}</label>
              <input
                id="name-prompt-input"
                autoFocus
                value={namePrompt.value}
                onChange={(event) => setNamePrompt((current) => (current === null ? null : { ...current, value: event.target.value }))}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeNamePrompt(null);
                }}
                className="mt-3 h-9 w-full rounded-shell border border-shell-border bg-transparent px-3 text-sm outline-none focus:border-[color:var(--shell-accent)]"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => closeNamePrompt(null)} className="rounded-shell border border-shell-border px-3 py-1.5 text-sm">
                  Cancel
                </button>
                <button type="submit" className="rounded-shell bg-[color:var(--shell-accent)] px-3 py-1.5 text-sm font-medium text-white">
                  OK
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </ShellLayout.Content>
      <ShellLayout.StatusArea>
        <div className="flex items-center justify-between px-3 text-xs text-current/65">
          <span className="truncate">{operations.progress?.done === false ? `Working ${operations.progress.completed}/${operations.progress.total}` : statusText}</span>
          {fs.hasPartialResults ? <span>Some items could not be read</span> : null}
        </div>
      </ShellLayout.StatusArea>
    </ShellLayout>
  );
}
