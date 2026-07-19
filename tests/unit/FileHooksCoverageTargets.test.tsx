import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFileSystem } from '../../src/renderer/src/hooks/files/useFileSystem';
import { useFileItem } from '../../src/renderer/src/hooks/files/useFileItem';
import { useAppStore } from '../../src/renderer/src/store';
import {
  CACHE_CLEANER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  FILE_TIMELINE_PATH,
  SMART_COLLECTIONS_PATH,
  SPACE_ANALYZER_PATH,
  THIS_PC_PATH,
} from '../../src/shared/constants';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const ipcState = vi.hoisted(() => ({
  invoke: vi.fn(),
  listeners: new Map<string, (payload: any) => void>(),
  unsub: vi.fn(),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => ipcState.invoke(...args),
    on: (channel: string, listener: (payload: any) => void) => {
      ipcState.listeners.set(channel, listener);
      return ipcState.unsub;
    },
  },
}));

const fileNode: FileSystemNode = {
  name: 'file.txt',
  path: '/home/me/file.txt',
  kind: 'file',
  sizeInBytes: 10,
  modifiedAt: 1,
  createdAt: 1,
  extension: 'txt',
};

const dirNode: FileSystemNode = {
  name: 'docs',
  path: '/home/me/docs',
  kind: 'directory',
  sizeInBytes: 0,
  modifiedAt: 1,
  createdAt: 1,
};

function setActivePath(path: string) {
  useAppStore.setState({
    showHiddenFiles: false,
    wellKnownDirs: {
      home: '/home/me',
      desktop: '/home/me/Desktop',
      documents: '/home/me/Documents',
      downloads: '/home/me/Downloads',
    },
    activeTabId: 'tab-1',
    tabs: [{
      id: 'tab-1',
      path,
      title: path,
      history: { back: [], forward: [] },
      viewMode: 'list',
      isPinned: false,
    }],
  } as any);
}

describe('file hook coverage targets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ipcState.listeners.clear();
    ipcState.invoke.mockImplementation(async (channel: string) => {
      if (channel === 'fs:readDirectory') return { nodes: [fileNode, dirNode], hasPartialResults: true };
      if (channel === 'smartCollections:scan') return { nodes: [fileNode], truncated: true };
      return undefined;
    });
    setActivePath('/home/me');
  });

  it('loads real directories, watches changes, opens files/directories, refreshes, and reports errors', async () => {
    const { result, unmount } = renderHook(() => useFileSystem());

    await waitFor(() => expect(result.current.nodes).toHaveLength(2));
    expect(result.current.hasPartialResults).toBe(true);
    expect(ipcState.invoke).toHaveBeenCalledWith('fs:watch', { path: '/home/me' });

    act(() => result.current.openNode(fileNode));
    expect(result.current.fileViewerTarget).toBe(fileNode);
    act(() => result.current.closeFileViewer());
    expect(result.current.fileViewerTarget).toBeNull();

    act(() => result.current.openNode(dirNode));
    expect(useAppStore.getState().activeTab()?.path).toBe('/home/me/docs');

    act(() => result.current.refresh());
    await waitFor(() => expect(ipcState.invoke).toHaveBeenCalledWith('fs:readDirectory', { path: '/home/me', includeHidden: false }));

    ipcState.invoke.mockImplementation(async (channel: string) => {
      if (channel === 'fs:readDirectory') throw new Error('permission denied');
      return undefined;
    });
    setActivePath('/bad');
    await waitFor(() => expect(result.current.error).toBe('permission denied'));
    expect(result.current.errorKind).not.toBeNull();

    unmount();
    expect(ipcState.unsub).toHaveBeenCalled();
    expect(ipcState.invoke).toHaveBeenCalledWith('fs:unwatch', { path: '/bad' });
  });

  it('resolves virtual locations and smart collection branches', async () => {
    const { result, rerender } = renderHook(() => useFileSystem());

    setActivePath(THIS_PC_PATH);
    rerender();
    await waitFor(() => expect(result.current.nodes.map((node) => node.name)).toEqual(expect.arrayContaining(['Desktop', 'Documents', 'Downloads', 'Home', 'Local Disk'])));

    for (const path of [CACHE_CLEANER_PATH, SPACE_ANALYZER_PATH, DEV_PANEL_PATH, DUPLICATE_FINDER_PATH, FILE_TIMELINE_PATH]) {
      setActivePath(path);
      rerender();
      await waitFor(() => expect(result.current.nodes).toEqual([]));
    }

    setActivePath(SMART_COLLECTIONS_PATH);
    rerender();
    await waitFor(() => expect(result.current.nodes.length).toBeGreaterThan(1));

    setActivePath(`${SMART_COLLECTIONS_PATH}/old-downloads`);
    rerender();
    await waitFor(() => expect(result.current.nodes).toEqual([fileNode]));
    expect(result.current.hasPartialResults).toBe(true);
    expect(ipcState.invoke).toHaveBeenCalledWith('smartCollections:scan', expect.objectContaining({
      id: 'old-downloads',
      roots: ['/home/me/Downloads'],
      includeHidden: false,
    }));

    setActivePath('/morph:/this-pc');
    rerender();
    await waitFor(() => expect(useAppStore.getState().activeTab()?.path).toBe('morph://this-pc'));
  });

  it('covers useFileItem drag, selection, context menu, rename, and drop handlers', () => {
    const onOpen = vi.fn();
    const onSelectionChange = vi.fn();
    const onContextMenu = vi.fn();
    const onCommitRename = vi.fn();
    const onCancelRename = vi.fn();
    const onRenameValueChange = vi.fn();
    const onMove = vi.fn();
    const onExternalDrag = vi.fn();
    const selectedPaths = new Set(['/home/me/file.txt']);
    const itemProps = {
        node: fileNode,
        nodes: [fileNode, dirNode],
        selectedPaths,
        renamingPath: fileNode.path,
        renamingValue: 'draft',
        onOpen,
        onSelectionChange,
        onContextMenu,
        onCommitRename,
        onCancelRename,
        onRenameValueChange,
        onMove,
        onExternalDrag,
    };
    const { result, rerender } = renderHook((props: any) => useFileItem(props), {
      initialProps: itemProps,
    });

    expect(result.current.selected).toBe(true);
    expect(result.current.isRenaming).toBe(true);

    const transfer = {
      effectAllowed: '',
      data: {} as Record<string, string>,
      setData(type: string, value: string) { this.data[type] = value; },
      getData(type: string) { return this.data[type] ?? ''; },
    };
    result.current.dragProps.onDragStart({ dataTransfer: transfer } as any);
    expect(onExternalDrag).toHaveBeenCalledWith(['/home/me/file.txt']);

    result.current.mouseProps.onMouseDown({ button: 0, ctrlKey: true, preventDefault: vi.fn() } as any);
    result.current.mouseProps.onClick({ stopPropagation: vi.fn(), metaKey: true } as any);
    expect(onSelectionChange).toHaveBeenCalled();

    result.current.mouseProps.onContextMenu({ preventDefault: vi.fn(), stopPropagation: vi.fn(), ctrlKey: false } as any);
    expect(onContextMenu).toHaveBeenCalledWith(fileNode, expect.any(Object));

    result.current.renameInputProps.onChange({ target: { value: 'renamed' } } as any);
    result.current.renameInputProps.onKeyDown({ key: 'Enter', preventDefault: vi.fn(), stopPropagation: vi.fn() } as any);
    result.current.renameInputProps.onKeyDown({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() } as any);
    expect(onRenameValueChange).toHaveBeenCalledWith('renamed');
    expect(onCommitRename).toHaveBeenCalled();
    expect(onCancelRename).toHaveBeenCalled();

    rerender({ ...itemProps, node: dirNode, selectedPaths: new Set<string>(), renamingPath: null });
    result.current.dragProps.onDrop({
      dataTransfer: transfer,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any);
    expect(onMove).toHaveBeenCalledWith(['/home/me/file.txt'], '/home/me/docs');
    result.current.mouseProps.onDoubleClick({} as any);
    expect(onOpen).toHaveBeenCalledWith(dirNode);
  });
});
