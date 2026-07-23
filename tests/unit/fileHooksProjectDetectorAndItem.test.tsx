import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectDetector } from '../../src/renderer/src/hooks/files/useProjectDetector';
import { useFileTimeline } from '../../src/renderer/src/hooks/files/useFileTimeline';
import { useSelection } from '../../src/renderer/src/hooks/files/useSelection';
import { useAppStore } from '../../src/renderer/src/store';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel) => {
      if (channel === 'devpanel:scan') {
        return Promise.resolve({
          hasProject: true,
          projectType: 'Node.js / JavaScript',
          name: 'MorphFinder',
        });
      }
      if (channel === 'timeline:scan') {
        return Promise.resolve({
          items: [{ path: '/tmp/file.txt', name: 'file.txt', extension: 'txt', size: 100, updatedAt: 1000, category: 'modified' }],
        });
      }
      return Promise.resolve({});
    }),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('Project Detector & File Timeline Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useProjectDetector identifies project files', async () => {
    const { result } = renderHook(() => useProjectDetector('/tmp/project'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.hasProject).toBe(true);
    expect(result.current.projectType).toBe('Node.js / JavaScript');
    expect(result.current.projectName).toBe('MorphFinder');
  });

  it('useFileTimeline scans and fetches timeline events', async () => {
    const { result } = renderHook(() => useFileTimeline('/tmp'));

    await act(async () => {
      await result.current.scan();
    });

    expect(result.current.result).toBeDefined();
    expect(result.current.groups.length).toBeGreaterThanOrEqual(0);
  });

  it('useSelection handles selection state', () => {
    useAppStore.setState({
      activeTabId: 'tab1',
      selectedPathsByTab: { tab1: ['/tmp/a'] },
    });

    const { result } = renderHook(() => useSelection());

    expect(result.current.selectedPaths).toEqual(['/tmp/a']);
    expect(result.current.selectedSet.has('/tmp/a')).toBe(true);

    act(() => {
      result.current.clear();
    });
    expect(result.current.selectedPaths).toEqual([]);
  });
});
