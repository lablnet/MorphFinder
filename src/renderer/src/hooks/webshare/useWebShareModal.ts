import { useCallback, useEffect, useState } from 'react';
import { useWebShare } from './useWebShare';

export function useWebShareModal(targetPath?: string | null, onClose?: () => void) {
  const { activeSession, isStarting, error, startShare, stopShare } = useWebShare();
  const [copied, setCopied] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (targetPath) {
      void startShare(targetPath);
    }
  }, [targetPath, startShare]);

  useEffect(() => {
    if (!activeSession) {
      setTimeLeftMs(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, activeSession.expiresAt - Date.now());
      setTimeLeftMs(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const copyUrl = useCallback(async () => {
    if (!activeSession?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(activeSession.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback copy
    }
  }, [activeSession?.shareUrl]);

  const formatRemainingTime = useCallback(() => {
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeftMs]);

  const handleStop = useCallback(async () => {
    if (activeSession) {
      await stopShare(activeSession.id);
    }
    if (onClose) onClose();
  }, [activeSession, stopShare, onClose]);

  return {
    activeSession,
    isStarting,
    error,
    copied,
    remainingFormatted: formatRemainingTime(),
    copyUrl,
    startShare,
    handleStop,
  };
}
