import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSystemLocations, getLocationIcon } from '@renderer/hooks/files/useSystemLocations';
import { Cloud, Disc, Folder, HardDrive, Home, Trash2 } from 'lucide-react';

describe('useSystemLocations', () => {
  it('returns default fallback locations initially and fetches dynamic locations via morph IPC', async () => {
    const mockLocations = [
      { id: '/', name: 'Macintosh HD', path: '/', iconType: 'hd', isRemovable: false, isInternal: true },
      { id: '/Volumes/External', name: 'External SSD', path: '/Volumes/External', iconType: 'removable', isRemovable: true, isInternal: false },
    ];

    const mockInvoke = vi.fn().mockResolvedValue(mockLocations);
    Object.defineProperty(window, 'morph', {
      value: { invoke: mockInvoke },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useSystemLocations());

    expect(mockInvoke).toHaveBeenCalledWith('native:getLocations', undefined);

    await waitFor(() => {
      expect(result.current).toEqual(mockLocations);
    });
  });

  it('handles IPC failure gracefully by keeping fallback default location', async () => {
    const mockInvoke = vi.fn().mockRejectedValue(new Error('IPC Failure'));
    Object.defineProperty(window, 'morph', {
      value: { invoke: mockInvoke },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useSystemLocations());

    expect(result.current).toEqual([
      { id: '/', name: 'Macintosh HD', path: '/', iconType: 'hd', isRemovable: false, isInternal: true },
    ]);
  });

  it('getLocationIcon returns the expected icon for each iconType', () => {
    expect(getLocationIcon('hd')).toBe(HardDrive);
    expect(getLocationIcon('removable')).toBe(Disc);
    expect(getLocationIcon('cloud')).toBe(Cloud);
    expect(getLocationIcon('trash')).toBe(Trash2);
    expect(getLocationIcon('home')).toBe(Home);
    expect(getLocationIcon('unknown')).toBe(Folder);
    expect(getLocationIcon(undefined)).toBe(Folder);
  });
});
