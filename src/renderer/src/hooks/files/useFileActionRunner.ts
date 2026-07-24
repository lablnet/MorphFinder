import { useCallback } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { ipc } from '@renderer/services/ipc';
import { useAppStore } from '@renderer/store';
import type { FileContextAction } from '../../components/files/FileContextMenu';
import type { UseFileSystemResult } from './useFileSystem';
import type { UseFileOperationsResult } from './useFileOperations';

type ClipboardState = { kind: 'copy' | 'cut'; paths: string[] } | null;

export interface FileActionRunnerOptions {
  contextNode: FileSystemNode | null;
  contextTargets: FileSystemNode[];
  fs: UseFileSystemResult;
  operations: UseFileOperationsResult;
  renameNode: (node: FileSystemNode) => void | Promise<void>;
  pasteClipboard: (node: FileSystemNode | null) => Promise<void>;
  createFolder: () => Promise<void>;
  closeContextMenu: () => void;
  setClipboard: (state: ClipboardState) => void;
  setAnnotationNode: (node: FileSystemNode | null) => void;
  setWebShareTargets: (paths: string[] | null) => void;
}

export function useFileActionRunner({
  contextNode,
  contextTargets,
  fs,
  operations,
  renameNode,
  pasteClipboard,
  createFolder,
  closeContextMenu,
  setClipboard,
  setAnnotationNode,
  setWebShareTargets,
}: FileActionRunnerOptions): (action: FileContextAction) => void {
  return useCallback((action: FileContextAction): void => {
    const primaryNode = contextNode ?? contextTargets[0] ?? null;
    const targetPaths = contextTargets.map((node) => node.path);
    closeContextMenu();

    if (action === 'open' && primaryNode !== null) fs.openNode(primaryNode);
    if (action === 'open-in-new-tab' && primaryNode !== null) {
      useAppStore.getState().openTab(primaryNode.path, { activate: true });
    }
    if (action === 'open-in-new-window' && primaryNode !== null) {
      void ipc.invoke('shell:newWindow', { path: primaryNode.path });
    }
    if (action === 'open-with-system' && primaryNode !== null) void ipc.invoke('shell:openWith', { path: primaryNode.path });
    if (action === 'rename' && primaryNode !== null) void renameNode(primaryNode);
    if (action === 'copy' && targetPaths.length > 0) setClipboard({ kind: 'copy', paths: targetPaths });
    if (action === 'cut' && targetPaths.length > 0) setClipboard({ kind: 'cut', paths: targetPaths });
    if (action === 'paste') void pasteClipboard(contextNode);
    if (action === 'trash' && targetPaths.length > 0) {
      void operations.trash(targetPaths).then(fs.refresh);
    }
    if (action === 'delete-permanently' && targetPaths.length > 0) {
      void ipc.invoke('shell:deletePermanently', { paths: targetPaths }).then(fs.refresh);
    }
    if (action === 'restore' && targetPaths.length > 0) {
      void ipc.invoke('shell:restoreFromTrash', { paths: targetPaths }).then(fs.refresh);
    }
    if (action === 'empty-trash') {
      void ipc.invoke('shell:emptyTrash', undefined).then(fs.refresh);
    }
    if (action === 'details' && primaryNode !== null) {
      useAppStore.getState().openDetails(primaryNode);
    }
    if (action === 'pin' && primaryNode !== null) {
      useAppStore.getState().pinFolder(primaryNode.path);
    }
    if (action === 'unpin' && primaryNode !== null) {
      useAppStore.getState().unpinFolder(primaryNode.path);
    }
    if (action === 'compress' && targetPaths.length > 0) {
      void operations.compress(targetPaths).then(fs.refresh);
    }
    if (action === 'extract' && primaryNode !== null) {
      void operations.extract(primaryNode.path).then(fs.refresh);
    }
    if (action === 'annotate' && primaryNode !== null) setAnnotationNode(primaryNode);
    if (action === 'webshare' && targetPaths.length > 0) setWebShareTargets(targetPaths);
    if (action === 'new-folder') void createFolder();
    if (action === 'show-in-folder' && primaryNode !== null) void ipc.invoke('shell:showInFolder', { path: primaryNode.path });
    if (action === 'refresh') fs.refresh();
  }, [
    closeContextMenu,
    contextNode,
    contextTargets,
    createFolder,
    fs,
    operations,
    pasteClipboard,
    renameNode,
    setAnnotationNode,
    setClipboard,
    setWebShareTargets,
  ]);
}
