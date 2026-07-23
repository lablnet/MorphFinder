import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDevPanel } from '../../src/renderer/src/hooks/files/useDevPanel';
import { useDevPanelScanPath } from '../../src/renderer/src/hooks/files/useDevPanelScanPath';
import { useFileColumnView } from '../../src/renderer/src/hooks/files/useFileColumnView';
import { useFileThumbnail } from '../../src/renderer/src/hooks/files/useFileThumbnail';
import { useMarquee } from '../../src/renderer/src/hooks/files/useMarquee';
import { useDirectoryAnnotations } from '../../src/renderer/src/hooks/files/useDirectoryAnnotations';
import { ipc } from '../../src/renderer/src/services/ipc';
import { useAppStore } from '../../src/renderer/src/store';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel) => {
      if (channel === 'devpanel:scan') {
        return Promise.resolve({
          name: 'MorphFinder',
          packageJson: { scripts: { test: 'vitest' } },
          environmentVariables: { NODE_ENV: 'test', SECRET: '123' },
        });
      }
      if (channel === 'fs:readDirectory') {
        return Promise.resolve({
          nodes: [{ name: 'subfile.txt', path: '/tmp/dir/subfile.txt', kind: 'file', size: 100, isHidden: false, isSymlink: false, updatedAt: 12345 }],
        });
      }
      if (channel === 'native:thumbnail') {
        return Promise.resolve({ dataUrl: 'data:image/png;base64,123' });
      }
      if (channel === 'annotations:get') {
        return Promise.resolve({ path: '/tmp/folder', tags: [], notes: 'My note', updatedAt: 100 });
      }
      if (channel === 'annotations:set') {
        return Promise.resolve({ path: '/tmp/folder', tags: [], notes: 'New note', updatedAt: 200 });
      }
      return Promise.resolve({});
    }),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('File Hooks Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDevPanel scans, reveals env keys, toggles favorites, and runs scripts', async () => {
    const { result } = renderHook(() => useDevPanel('/project'));

    await act(async () => {
      result.current.refresh();
    });

    expect(ipc.invoke).toHaveBeenCalledWith('devpanel:scan', { path: '/project' });
    expect(result.current.info?.name).toBe('MorphFinder');

    act(() => {
      result.current.revealEnvKey('SECRET');
    });
    expect(result.current.revealedEnvKeys.has('SECRET')).toBe(true);

    act(() => {
      result.current.toggleFavoriteScript('test');
    });
    expect(result.current.favoriteScripts.has('test')).toBe(true);

    act(() => {
      result.current.setActiveTab('scripts');
    });
    expect(result.current.activeTab).toBe('scripts');
  });

  it('useDevPanelScanPath returns scanPath', () => {
    useAppStore.setState({
      tabs: [{
        id: 't1',
        path: '/current-project',
        title: 'current-project',
        history: { back: ['/old-project'], forward: [] },
        viewMode: 'icons',
        isPinned: false,
      }],
      activeTabId: 't1',
    });

    const { result } = renderHook(() => useDevPanelScanPath());
    expect(result.current.scanPath).toBe('/current-project');
    expect(typeof result.current.pickFolder).toBe('function');
  });

  it('useFileColumnView manages columns state', () => {
    useAppStore.setState({
      tabs: [{ id: 't1', path: '/tmp', history: { back: [], forward: [] }, viewMode: 'column' }],
      activeTabId: 't1',
    });

    const rootNodes = [
      { name: 'folder1', path: '/tmp/folder1', kind: 'directory' as const, size: 0, isHidden: false, isSymlink: false, updatedAt: 123 },
    ];
    const { result } = renderHook(() => useFileColumnView({ nodes: rootNodes, selectedPaths: new Set() }));

    expect(result.current.columns.length).toBe(1);
    expect(result.current.columns[0].path).toBe('/tmp');
  });

  it('useFileThumbnail fetches thumbnail dataUrl', async () => {
    const node = {
      name: 'photo.jpg',
      extension: 'jpg',
      path: '/tmp/photo.jpg',
      kind: 'file' as const,
      size: 1024,
      isHidden: false,
      isSymlink: false,
      updatedAt: 1234,
    };

    const { result } = renderHook(() => useFileThumbnail(node, 64));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.thumbnailUrl).toBe('data:image/png;base64,123');
  });

  it('useMarquee handles selection rectangle calculation', () => {
    const onSelectionChange = vi.fn();
    const calculateSelection = vi.fn().mockReturnValue(['/tmp/a']);

    const { result } = renderHook(() => useMarquee(onSelectionChange, calculateSelection));

    expect(result.current.marqueeRect).toBeNull();
    expect(result.current.suppressNextClick).toBe(false);

    const mockTarget = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 500, height: 500 }) };

    act(() => {
      result.current.marqueeHandlers.onMouseDown({ button: 0, target: document.createElement('div'), currentTarget: mockTarget, clientX: 10, clientY: 10 } as any);
    });

    act(() => {
      result.current.marqueeHandlers.onMouseMove({ currentTarget: mockTarget, clientX: 100, clientY: 100 } as any);
    });

    act(() => {
      result.current.marqueeHandlers.onMouseUp();
    });

    expect(onSelectionChange).toHaveBeenCalledWith(['/tmp/a']);
  });

  it('useDirectoryAnnotations manages tags and notes', async () => {
    const { result } = renderHook(() => useDirectoryAnnotations('/tmp/folder'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.annotation.notes).toBe('My note');

    await act(async () => {
      await result.current.save({ tags: [], notes: 'New note' });
    });

    expect(ipc.invoke).toHaveBeenCalledWith('annotations:set', { path: '/tmp/folder', tags: [], notes: 'New note' });
  });
});
