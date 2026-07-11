import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';
import type { Terminal } from 'xterm';

export function useTerminal() {
  const terminalOpen = useAppStore((state) => state.terminalOpen);
  const terminalHeight = useAppStore((state) => state.terminalHeight);
  const toggleTerminal = useAppStore((state) => state.toggleTerminal);
  const setTerminalOpen = useAppStore((state) => state.setTerminalOpen);
  const setTerminalHeight = useAppStore((state) => state.setTerminalHeight);
  const activePath = useAppStore((state) => state.activeTab()?.path ?? null);

  const sessionIdRef = useRef<string | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const activePathRef = useRef<string | null>(null);

  // Sync active path to ref for use inside event handlers without re-binding
  useEffect(() => {
    activePathRef.current = activePath;
  }, [activePath]);

  // Kill session helper
  const killSession = useCallback(async () => {
    if (sessionIdRef.current) {
      await ipc.invoke('terminal:kill', { id: sessionIdRef.current });
      sessionIdRef.current = null;
    }
  }, []);

  // Create session helper
  const createSession = useCallback(async (cwd: string) => {
    await killSession();
    try {
      const { id } = await ipc.invoke('terminal:create', { cwd });
      sessionIdRef.current = id;
      return id;
    } catch (err) {
      console.error('Failed to create terminal session:', err);
      return null;
    }
  }, [killSession]);

  // Restart terminal session
  const restart = useCallback(async () => {
    const cwd = activePathRef.current && !activePathRef.current.startsWith('morph://')
      ? activePathRef.current
      : navigator.platform.toLowerCase().includes('win') ? 'C:\\' : '/';

    const id = await createSession(cwd);
    if (id && xtermRef.current) {
      xtermRef.current.reset();
      xtermRef.current.write('\r\n\x1b[1;36m[MorphFinder Terminal Restarted]\x1b[0m\r\n\r\n');
    }
  }, [createSession]);

  // Write to terminal helper
  const writeData = useCallback((data: string) => {
    if (sessionIdRef.current) {
      void ipc.invoke('terminal:write', { id: sessionIdRef.current, data });
    }
  }, []);

  // Resize terminal helper
  const resizeSession = useCallback((cols: number, rows: number) => {
    if (sessionIdRef.current) {
      void ipc.invoke('terminal:resize', { id: sessionIdRef.current, cols, rows });
    }
  }, []);

  // Set terminal reference and bind listeners
  const setXtermInstance = useCallback((xterm: Terminal | null) => {
    xtermRef.current = xterm;
  }, []);

  // Listen for background events from the main process
  useEffect(() => {
    const unsubData = ipc.on('terminal:data', (payload: any) => {
      const { id, data } = payload;
      if (id === sessionIdRef.current && xtermRef.current) {
        xtermRef.current.write(data);
      }
    });

    const unsubExit = ipc.on('terminal:exit', (payload: any) => {
      const { id, exitCode } = payload;
      if (id === sessionIdRef.current && xtermRef.current) {
        xtermRef.current.write(`\r\n\r\n\x1b[1;31m[Process exited with code ${exitCode}]\x1b[0m\r\n`);
        sessionIdRef.current = null;
      }
    });

    return () => {
      unsubData();
      unsubExit();
    };
  }, []);

  // Create initial session when opened, and kill when closed/unmounted
  useEffect(() => {
    if (terminalOpen) {
      if (!sessionIdRef.current) {
        const initialCwd = activePathRef.current && !activePathRef.current.startsWith('morph://')
          ? activePathRef.current
          : navigator.platform.toLowerCase().includes('win') ? 'C:\\' : '/';
        void createSession(initialCwd);
      }
    } else {
      void killSession();
    }

    return () => {
      // Keep terminal running or kill on unmount? Let's clean up on unmount
      if (!terminalOpen) {
        void killSession();
      }
    };
  }, [terminalOpen, createSession, killSession]);

  // Sync directory navigation: automatically cd when the user changes directories
  useEffect(() => {
    if (!terminalOpen || !sessionIdRef.current || !activePath) return;
    if (activePath.startsWith('morph://')) return;

    // Trigger path change
    // Using a brief timeout or delay to prevent collision with rapid path typing
    const timer = setTimeout(() => {
      const cleanPath = activePath.replace(/"/g, '\\"');
      writeData(`cd "${cleanPath}"\r`);
    }, 200);

    return () => clearTimeout(timer);
  }, [activePath, terminalOpen, writeData]);

  // Kill terminal on window unload
  useEffect(() => {
    const handleUnload = () => {
      if (sessionIdRef.current) {
        ipc.invoke('terminal:kill', { id: sessionIdRef.current });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return {
    isOpen: terminalOpen,
    height: terminalHeight,
    toggle: toggleTerminal,
    setOpen: setTerminalOpen,
    setHeight: setTerminalHeight,
    setXtermInstance,
    writeData,
    resizeSession,
    restart,
  };
}
