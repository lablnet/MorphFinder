import { useCallback, useEffect, useState } from 'react';
import type { WebShareSession } from '@shared/types/webShare';

interface MorphWindow {
  morph: {
    invoke: (channel: string, request?: unknown) => Promise<unknown>;
    on: (channel: string, listener: (payload: unknown) => void) => () => void;
  };
}

const getMorphApi = () => (window as unknown as MorphWindow).morph;

export function useWebShare() {
  const [activeSession, setActiveSession] = useState<WebShareSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getMorphApi();
    if (!api) return;

    void api.invoke('webshare:getActive').then((session) => {
      if (session) setActiveSession(session as WebShareSession);
    });

    const cleanup = api.on('webshare:updated', (payload) => {
      setActiveSession((payload as WebShareSession) || null);
    });

    return cleanup;
  }, []);

  const startShare = useCallback(async (targetInput: string | string[]): Promise<WebShareSession | null> => {
    setIsStarting(true);
    setError(null);
    try {
      const api = getMorphApi();
      const payload = Array.isArray(targetInput) ? { paths: targetInput } : { path: targetInput };
      const session = (await api.invoke('webshare:start', payload)) as WebShareSession;
      setActiveSession(session);
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start WebShare';
      setError(msg);
      return null;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopShare = useCallback(async (sessionId?: string): Promise<void> => {
    try {
      const api = getMorphApi();
      await api.invoke('webshare:stop', { sessionId });
      setActiveSession(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to stop WebShare';
      setError(msg);
    }
  }, []);

  return {
    activeSession,
    isStarting,
    error,
    startShare,
    stopShare,
  };
}
