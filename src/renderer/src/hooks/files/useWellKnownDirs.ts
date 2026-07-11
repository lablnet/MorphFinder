import { useEffect } from 'react';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';

/** Fetches Home/Desktop/Documents/Downloads once and caches them in the store —
 *  every shell's sidebar reads from `wellKnownDirs` rather than re-fetching. */
export function useWellKnownDirs(): void {
  const wellKnownDirs = useAppStore((state) => state.wellKnownDirs);
  const setWellKnownDirs = useAppStore((state) => state.setWellKnownDirs);

  useEffect(() => {
    if (wellKnownDirs !== null) return;
    void ipc.invoke('fs:wellKnownDirs', undefined).then(setWellKnownDirs);
  }, [wellKnownDirs, setWellKnownDirs]);
}
