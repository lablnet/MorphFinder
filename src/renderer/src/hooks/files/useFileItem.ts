import { useCallback, useMemo } from 'react';
import type React from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { pathsForDrag, readDraggedPaths, writeDraggedPaths } from '../../components/files/dragDrop';
import { nextSelectionForEvent } from '../../components/files/selection';

export interface UseFileItemOptions {
  node: FileSystemNode;
  nodes: FileSystemNode[];
  selectedPaths: ReadonlySet<string>;
  renamingPath: string | null;
  renamingValue: string;
  onOpen: (node: FileSystemNode) => void;
  onSelectionChange: (paths: string[], anchorPath?: string) => void;
  onContextMenu: (node: FileSystemNode | null, event: React.MouseEvent) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onRenameValueChange: (value: string) => void;
  onMove: (paths: string[], destinationDir: string) => void;
  onExternalDrag: (paths: string[]) => void;
}

export function useFileItem({
  node,
  nodes,
  selectedPaths,
  renamingPath,
  renamingValue,
  onOpen,
  onSelectionChange,
  onContextMenu,
  onCommitRename,
  onCancelRename,
  onRenameValueChange,
  onMove,
  onExternalDrag,
}: UseFileItemOptions) {
  const selected = useMemo(() => selectedPaths.has(node.path), [selectedPaths, node.path]);
  const isRenaming = useMemo(() => renamingPath === node.path, [renamingPath, node.path]);

  const onDragStart = useCallback((event: React.DragEvent) => {
    const paths = pathsForDrag(node.path, selectedPaths);
    writeDraggedPaths(event.dataTransfer, paths);
    onExternalDrag(paths);
  }, [node.path, selectedPaths, onExternalDrag]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (node.kind === 'directory') {
      event.preventDefault();
    }
  }, [node.kind]);

  const onDrop = useCallback((event: React.DragEvent) => {
    if (node.kind !== 'directory') return;
    event.preventDefault();
    event.stopPropagation();
    const paths = readDraggedPaths(event.dataTransfer).filter((path) => path !== node.path);
    if (paths.length > 0) {
      onMove(paths, node.path);
    }
  }, [node.path, node.kind, onMove]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0 && event.ctrlKey) {
      event.preventDefault();
    }
  }, []);

  const onClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectionChange(nextSelectionForEvent(nodes, selectedPaths, node, event), node.path);
  }, [nodes, selectedPaths, node, onSelectionChange]);

  const onDoubleClick = useCallback(() => {
    if (!isRenaming) {
      onOpen(node);
    }
  }, [isRenaming, onOpen, node]);

  const onContextMenuHandler = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey) {
      onSelectionChange(nextSelectionForEvent(nodes, selectedPaths, node, event), node.path);
      return;
    }
    if (!selectedPaths.has(node.path)) {
      onSelectionChange([node.path], node.path);
    }
    onContextMenu(node, event);
  }, [nodes, selectedPaths, node, onSelectionChange, onContextMenu]);

  const onRenameInputClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const onRenameInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onRenameValueChange(event.target.value);
  }, [onRenameValueChange]);

  const onRenameInputFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  }, []);

  const onRenameInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      onCommitRename();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancelRename();
    }
  }, [onCommitRename, onCancelRename]);

  const dragProps = useMemo(() => ({
    draggable: true,
    onDragStart,
    onDragOver,
    onDrop,
  }), [onDragStart, onDragOver, onDrop]);

  const mouseProps = useMemo(() => ({
    onMouseDown,
    onClick,
    onDoubleClick,
    onContextMenu: onContextMenuHandler,
  }), [onMouseDown, onClick, onDoubleClick, onContextMenuHandler]);

  const renameInputProps = useMemo(() => ({
    autoFocus: true,
    value: renamingValue,
    onClick: onRenameInputClick,
    onChange: onRenameInputChange,
    onFocus: onRenameInputFocus,
    onBlur: onCommitRename,
    onKeyDown: onRenameInputKeyDown,
  }), [renamingValue, onRenameInputClick, onRenameInputChange, onRenameInputFocus, onCommitRename, onRenameInputKeyDown]);

  return {
    selected,
    isRenaming,
    dragProps,
    mouseProps,
    renameInputProps,
  };
}
