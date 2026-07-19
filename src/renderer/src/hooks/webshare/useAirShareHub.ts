import { useCallback, useEffect, useState } from 'react';
import type { WebShareSession } from '@shared/types/webShare';

interface MorphWindow {
  morph: {
    invoke: (channel: string, request?: unknown) => Promise<unknown>;
    on: (channel: string, listener: (payload: unknown) => void) => () => void;
  };
}

const getMorphApi = () => (window as unknown as MorphWindow).morph;

export function useAirShareHub() {
  const [activeSession, setActiveSession] = useState<WebShareSession | null>(null);
  const [allowInboundState, setAllowInboundState] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const api = getMorphApi();
    if (!api) return;

    void api.invoke('webshare:getActive').then((session) => {
      if (session) {
        const s = session as WebShareSession;
        setActiveSession(s);
        setAllowInboundState(s.allowInbound);
      }
    });

    const cleanup = api.on('webshare:updated', (payload) => {
      const s = (payload as WebShareSession) || null;
      setActiveSession(s);
      if (s) setAllowInboundState(s.allowInbound);
    });

    return cleanup;
  }, []);

  const setFolder = useCallback(async (folderPath: string): Promise<void> => {
    try {
      setIsStarting(true);
      const api = getMorphApi();
      const session = (await api.invoke('airshare:setFolder', { path: folderPath })) as WebShareSession;
      setActiveSession(session);
      setAllowInboundState(session.allowInbound);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set share folder';
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  }, []);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      const api = getMorphApi();
      const folderPath = (await api.invoke('shell:selectFolder')) as string | null;
      if (folderPath) {
        await setFolder(folderPath);
        return folderPath;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set share folder';
      setError(msg);
    }
    return null;
  }, [setFolder]);

  const toggleInbound = useCallback(async (allowInbound: boolean) => {
    setAllowInboundState(allowInbound);
    try {
      const api = getMorphApi();
      const session = (await api.invoke('airshare:toggleInbound', { allowInbound })) as WebShareSession | null;
      if (session) {
        setActiveSession(session);
        setAllowInboundState(session.allowInbound);
      }
    } catch {
      // ignore
    }
  }, []);

  const stopShare = useCallback(async () => {
    if (!activeSession) return;
    try {
      const api = getMorphApi();
      await api.invoke('webshare:stop', { sessionId: activeSession.id });
      setActiveSession(null);
    } catch {
      // ignore
    }
  }, [activeSession]);

  const copyUrl = useCallback(async () => {
    if (!activeSession?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(activeSession.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [activeSession?.shareUrl]);

  return {
    activeSession,
    allowInbound: allowInboundState,
    isStarting,
    error,
    copied,
    setFolder,
    selectFolder,
    toggleInbound,
    stopShare,
    copyUrl,
  };
}
