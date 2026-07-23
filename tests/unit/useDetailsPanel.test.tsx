import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDetailsPanel } from '@renderer/hooks/files/useDetailsPanel';
import type { FileSystemNode } from '@shared/types/fileSystem';

vi.mock('./useDirectoryAnnotations', () => ({
  useDirectoryAnnotations: vi.fn().mockReturnValue({
    annotation: { tags: [], notes: '', updatedAt: 0 },
    isSaving: false,
    isLoading: false,
    error: null,
    save: vi.fn(),
  }),
}));

describe('useDetailsPanel', () => {
  it('manages local tag/note state and detects changes', () => {
    const node: FileSystemNode = {
      path: '/test/file.txt',
      name: 'file.txt',
      kind: 'file',
      sizeInBytes: 100,
      modifiedAt: Date.now(),
      createdAt: Date.now(),
      isHidden: false,
      extension: 'txt',
    };

    const { result } = renderHook(() => useDetailsPanel(node));

    expect(result.current.hasChanges).toBe(false);

    act(() => {
      result.current.setNotes('My notes');
    });

    expect(result.current.notes).toBe('My notes');
    expect(result.current.hasChanges).toBe(true);
  });
});
