import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboarding } from '@renderer/hooks/useOnboarding';

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens onboarding by default when key is missing in localStorage', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.isOpen).toBe(true);
  });

  it('does not open onboarding if user has already seen it', () => {
    localStorage.setItem('morphfinder:has_seen_onboarding_v1', 'true');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.isOpen).toBe(false);
  });

  it('allows manually closing onboarding and sets localStorage key', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.closeOnboarding();
    });
    expect(result.current.isOpen).toBe(false);
    expect(localStorage.getItem('morphfinder:has_seen_onboarding_v1')).toBe('true');
  });

  it('allows manually opening onboarding', () => {
    localStorage.setItem('morphfinder:has_seen_onboarding_v1', 'true');
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.openOnboarding();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('resets onboarding by clearing localStorage', () => {
    localStorage.setItem('morphfinder:has_seen_onboarding_v1', 'true');
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.resetOnboarding();
    });
    expect(result.current.isOpen).toBe(true);
    expect(localStorage.getItem('morphfinder:has_seen_onboarding_v1')).toBeNull();
  });
});
