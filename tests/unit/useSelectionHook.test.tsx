import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from '@renderer/hooks/files/useSelection';
import { useAppStore } from '@renderer/store';

describe('useSelection', () => {
  it('reads and modifies selection for active tab', () => {
    useAppStore.setState({
      activeTabId: 'tab-1',
      selectedPathsByTab: { 'tab-1': ['/a.txt'] },
    });

    const { result } = renderHook(() => useSelection());

    expect(result.current.selectedPaths).toEqual(['/a.txt']);
    expect(result.current.selectedSet.has('/a.txt')).toBe(true);

    act(() => {
      result.current.set(['/b.txt'], '/b.txt');
    });

    expect(result.current.selectedPaths).toEqual(['/b.txt']);

    act(() => {
      result.current.clear();
    });

    expect(result.current.selectedPaths).toEqual([]);
  });
});
