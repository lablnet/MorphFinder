import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@renderer/store';
import { ipc } from '@renderer/services/ipc';

export function useTerminal() {
  const terminalOpen = useAppStore((state) => state.terminalOpen);
  const terminalHeight = useAppStore((state) => state.terminalHeight);
  const toggleTerminal = useAppStore((state) => state.toggleTerminal);
  const setTerminalOpen = useAppStore((state) => state.setTerminalOpen);
  const setTerminalHeight = useAppStore((state) => state.setTerminalHeight);
  const terminalQueuedCommand = useAppStore((state) => state.terminalQueuedCommand);
  const clearTerminalQueuedCommand = useAppStore((state) => state.clearTerminalQueuedCommand);
  const activePath = useAppStore((state) => state.activeTab()?.path ?? null);
  const [output, setOutput] = useState('');

  const sessionIdRef = useRef<string | null>(null);
  const activePathRef = useRef<string | null>(null);
  const handledCommandNonceRef = useRef<number | null>(null);

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
    if (id) {
      setOutput('\n[MorphFinder Terminal Restarted]\n\n');
    }
  }, [createSession]);

  // Write to terminal helper
  const writeData = useCallback((data: string) => {
    if (sessionIdRef.current) {
      void ipc.invoke('terminal:write', { id: sessionIdRef.current, data });
    }
  }, []);

  const writeQueuedCommand = useCallback((): void => {
    if (terminalQueuedCommand === null || sessionIdRef.current === null) return;
    if (handledCommandNonceRef.current === terminalQueuedCommand.nonce) return;
    handledCommandNonceRef.current = terminalQueuedCommand.nonce;
    const cleanPath = terminalQueuedCommand.cwd.replace(/"/g, '\\"');
    writeData(`cd "${cleanPath}"\n${terminalQueuedCommand.command}\n`);
    clearTerminalQueuedCommand();
  }, [clearTerminalQueuedCommand, terminalQueuedCommand, writeData]);

  const resizeSession = useCallback((cols: number, rows: number) => {
    if (sessionIdRef.current) {
      void ipc.invoke('terminal:resize', { id: sessionIdRef.current, cols, rows });
    }
  }, []);

  // Listen for background events from the main process
  useEffect(() => {
    const unsubData = ipc.on('terminal:data', (payload: { id: string; data: string }) => {
      const { id, data } = payload;
      if (id === sessionIdRef.current) {
        setOutput((current) => `${current}${data}`);
      }
    });

    const unsubExit = ipc.on('terminal:exit', (payload: { id: string; exitCode: number }) => {
      const { id, exitCode } = payload;
      if (id === sessionIdRef.current) {
        setOutput((current) => `${current}\n\n[Process exited with code ${exitCode}]\n`);
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
        void createSession(initialCwd).then(() => {
          writeQueuedCommand();
        });
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
  }, [terminalOpen, createSession, killSession, writeQueuedCommand]);

  // Sync directory navigation: automatically cd when the user changes directories
  useEffect(() => {
    if (!terminalOpen || !sessionIdRef.current || !activePath) return;
    if (activePath.startsWith('morph://')) return;

    // Trigger path change
    // Using a brief timeout or delay to prevent collision with rapid path typing
    const timer = setTimeout(() => {
      const cleanPath = activePath.replace(/"/g, '\\"');
      writeData(`cd "${cleanPath}"\n`);
    }, 200);

    return () => clearTimeout(timer);
  }, [activePath, terminalOpen, writeData]);

  useEffect(() => {
    if (!terminalOpen || terminalQueuedCommand === null || sessionIdRef.current === null) return;
    if (handledCommandNonceRef.current === terminalQueuedCommand.nonce) return;

    const timer = setTimeout(() => {
      writeQueuedCommand();
    }, 250);

    return () => clearTimeout(timer);
  }, [terminalOpen, terminalQueuedCommand, writeQueuedCommand]);

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
    output,
    toggle: toggleTerminal,
    setOpen: setTerminalOpen,
    setHeight: setTerminalHeight,
    writeData,
    resizeSession,
    restart,
  };
}
