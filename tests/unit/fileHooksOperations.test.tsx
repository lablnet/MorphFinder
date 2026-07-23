import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileOperations } from '../../src/renderer/src/hooks/files/useFileOperations';
import { useArchiveProgress } from '../../src/renderer/src/hooks/files/useArchiveProgress';
import { useFileOperationProgress } from '../../src/renderer/src/hooks/files/useFileOperationProgress';
import { ipc } from '../../src/renderer/src/services/ipc';

vi.mock('../../src/renderer/src/services/ipc', () => {
  const listeners = new Map<string, Function>();
  return {
    ipc: {
      invoke: vi.fn().mockImplementation((channel) => {
        if (channel === 'fs:operate') return Promise.resolve({ operationId: 'op-123' });
        if (channel === 'archive:compress') return Promise.resolve({ archivePath: '/tmp/test.zip' });
        if (channel === 'archive:extract') return Promise.resolve({ extractedDir: '/tmp/extracted' });
        return Promise.resolve({});
      }),
      on: vi.fn().mockImplementation((channel, cb) => {
        listeners.set(channel, cb);
        return () => listeners.delete(channel);
      }),
      emitMock: (channel: string, payload: any) => {
        listeners.get(channel)?.(payload);
      },
    },
  };
});

describe('File Operations & Progress Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useFileOperations trash, copy, move, compress, extract', async () => {
    const { result } = renderHook(() => useFileOperations());

    await act(async () => {
      await result.current.trash(['/tmp/file1.txt']);
    });
    expect(ipc.invoke).toHaveBeenCalledWith('fs:operate', { kind: 'trash', sourcePaths: ['/tmp/file1.txt'] });
    expect(result.current.progress?.operationId).toBe('op-123');

    await act(async () => {
      await result.current.copyTo(['/tmp/file1.txt'], '/tmp/dest');
    });
    expect(ipc.invoke).toHaveBeenCalledWith('fs:operate', { kind: 'copy', sourcePaths: ['/tmp/file1.txt'], destinationDir: '/tmp/dest' });

    await act(async () => {
      await result.current.moveTo(['/tmp/file1.txt'], '/tmp/dest');
    });
    expect(ipc.invoke).toHaveBeenCalledWith('fs:operate', { kind: 'move', sourcePaths: ['/tmp/file1.txt'], destinationDir: '/tmp/dest' });

    await act(async () => {
      const zip = await result.current.compress(['/tmp/file1.txt']);
      expect(zip).toBe('/tmp/test.zip');
    });

    await act(async () => {
      const ext = await result.current.extract('/tmp/test.zip');
      expect(ext).toBe('/tmp/extracted');
    });

    // Test empty sourcePaths edge case
    await act(async () => {
      await result.current.trash([]);
    });
  });

  it('useArchiveProgress listens to archive progress events', () => {
    const { result } = renderHook(() => useArchiveProgress());
    expect(result.current.archives).toEqual([]);

    act(() => {
      (ipc as any).emitMock('archive:progress', { archiveId: 'arch-1', archivePath: '/tmp/a.zip', currentPath: '/tmp/a.txt', progress: 50 });
    });
    expect(result.current.archives.length).toBe(1);
  });

  it('useFileOperationProgress listens to fs operation progress events', () => {
    const { result } = renderHook(() => useFileOperationProgress());
    expect(result.current.fileOperations).toEqual([]);

    act(() => {
      (ipc as any).emitMock('fs:operationProgress', { operationId: 'op-1', completed: 1, total: 2, currentPath: '/tmp/a', done: false });
    });
  });
});
