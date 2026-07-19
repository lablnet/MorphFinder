import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutShell } from '@renderer/hooks/ui/useLayoutShell';
import { useAppStore } from '@renderer/store';

describe('useLayoutShell', () => {
  it('exposes shell definition and allows changing active shell', () => {
    useAppStore.setState({ activeShell: 'finder' });

    const { result } = renderHook(() => useLayoutShell());

    expect(result.current.shell.id).toBe('finder');

    act(() => {
      result.current.setShell('explorer');
    });

    expect(result.current.shell.id).toBe('explorer');
  });

  it('allows cycling shells', () => {
    useAppStore.setState({ activeShell: 'finder' });

    const { result } = renderHook(() => useLayoutShell());

    act(() => {
      result.current.cycleShell();
    });

    expect(result.current.shell.id).toBe('explorer');
  });
});
