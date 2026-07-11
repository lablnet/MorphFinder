import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { ipc } from '@renderer/services/ipc';
import { THIS_PC_PATH } from '@shared/constants';
import { nextSelectionForKeyboard, type SelectionNavigationKey } from '../../components/files/selection';
import { useFileSystem } from './useFileSystem';
import { useFileOperations } from './useFileOperations';
import { useSelection } from './useSelection';
import { useLayoutShell } from '../ui/useLayoutShell';
import { useTabs } from '../ui/useTabs';
import { useTheme } from '../ui/useTheme';
import { useAppStore } from '@renderer/store';
import type { FileContextAction, FileContextMenuState } from '../../components/files/FileContextMenu';

type ClipboardState = { kind: 'copy' | 'cut'; paths: string[] } | null;
type RenameDraft = { node: FileSystemNode; value: string; error: string | null } | null;

export interface AppNamePromptState {
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

export function useFileSystemController() {
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

  const onRenameValueChange = useCallback((value: string) => {
    setRenameDraft((current) => (current === null ? null : { ...current, value, error: null }));
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onNamePromptChange = useCallback((value: string) => {
    setNamePrompt((current) => (current === null ? null : { ...current, value }));
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

  const createFolder = useCallback(async (): Promise<void> => {
    if (tabs.activePath.length === 0 || isVirtualLocation) return;
    const name = (await askForName('New Folder', 'Untitled Folder'))?.trim();
    if (name === undefined || name.length === 0) return;
    await ipc.invoke('fs:createFolder', { parentPath: tabs.activePath, name });
    fs.refresh();
  }, [tabs.activePath, isVirtualLocation, askForName, fs]);

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

  const openContextMenu = useCallback((node: FileSystemNode | null, event: React.MouseEvent): void => {
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
  }, [selectedNodes, selection.selectedSet, clipboard, destinationForPaste]);

  const runContextAction = useCallback((action: FileContextAction): void => {
    const primaryNode = contextNode ?? contextTargets[0] ?? null;
    setContextMenu(null);

    if (action === 'open' && primaryNode !== null) fs.openNode(primaryNode);
    if (action === 'open-with-system' && primaryNode !== null) void ipc.invoke('shell:openWith', { path: primaryNode.path });
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
  }, [contextNode, contextTargets, fs, renameNode, pasteClipboard, operations, createFolder]);

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

  const statusText = useMemo(() => {
    return fs.isLoading
      ? 'Loading...'
      : renameDraft?.error !== null && renameDraft?.error !== undefined
        ? renameDraft.error
        : fs.error !== null
        ? fs.error
        : `${fs.nodes.length} item${fs.nodes.length === 1 ? '' : 's'}${selection.selectedPaths.length > 0 ? `, ${selection.selectedPaths.length} selected` : ''}`;
  }, [fs.isLoading, fs.error, fs.nodes, selection.selectedPaths, renameDraft]);

  return {
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
  };
}
