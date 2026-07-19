import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArchiveProgress } from '../../src/renderer/src/hooks/files/useArchiveProgress';
import { useFileOperationProgress } from '../../src/renderer/src/hooks/files/useFileOperationProgress';
import { ipc } from '../../src/renderer/src/services/ipc';

let archiveCallback: (data: any) => void;
let fsOpCallback: (data: any) => void;

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    on: vi.fn().mockImplementation((channel, cb) => {
      if (channel === 'archive:progress') archiveCallback = cb;
      if (channel === 'fs:operationProgress') fsOpCallback = cb;
      return () => {};
    }),
    invoke: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useArchiveProgress & useFileOperationProgress Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('handles archive progress updates and cancellation', () => {
    const { result } = renderHook(() => useArchiveProgress());

    act(() => {
      archiveCallback({ operationId: 'op1', currentPath: '/tmp/test.zip', done: false });
    });

    expect(result.current.archives.length).toBe(1);

    act(() => {
      archiveCallback({ operationId: 'op1', currentPath: '/tmp/test.zip', done: true });
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.archives.length).toBe(0);

    act(() => {
      archiveCallback({ operationId: 'op2', currentPath: '/tmp/test2.zip', done: false });
    });

    act(() => {
      result.current.cancelArchive('op2');
    });

    expect(result.current.archives.length).toBe(0);
  });

  it('handles file operation progress updates and cancellation', () => {
    const { result } = renderHook(() => useFileOperationProgress());

    act(() => {
      fsOpCallback({ operationId: 'op1', currentPath: '/tmp/file.txt', done: false });
    });

    expect(result.current.fileOperations.length).toBe(1);

    act(() => {
      fsOpCallback({ operationId: 'op1', currentPath: '/tmp/file.txt', done: true });
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.fileOperations.length).toBe(0);

    act(() => {
      fsOpCallback({ operationId: 'op2', currentPath: '/tmp/file2.txt', done: false });
    });

    act(() => {
      result.current.cancelFileOp('op2');
    });

    expect(result.current.fileOperations.length).toBe(0);
  });
});
