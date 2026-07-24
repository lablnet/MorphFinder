import React from 'react';
import { Wifi, Loader2 } from 'lucide-react';
import { useWebShareModal } from '../../hooks/webshare/useWebShareModal';
import { WebShareDialog } from './WebShareDialog';
import { WebShareQrCard } from './WebShareQrCard';
import { WebShareInfoBanner } from './WebShareInfoBanner';
import { WebShareControls } from './WebShareControls';

interface WebShareModalProps {
  isOpen: boolean;
  targetPath?: string | string[] | null | undefined;
  onClose: () => void;
}

export const WebShareModal: React.FC<WebShareModalProps> = ({ isOpen, targetPath, onClose }) => {
  const {
    activeSession,
    isStarting,
    error,
    copied,
    remainingFormatted,
    copyUrl,
    handleStop,
  } = useWebShareModal(targetPath, onClose);

  return (
    <WebShareDialog isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between pb-3 border-b border-shell-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-current">Local Network Share</h3>
            <p className="text-xs text-current/60">Zero-cloud peer file server</p>
          </div>
        </div>
      </div>

      {isStarting && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-current/60">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs">Initializing local HTTP server & QR code...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {!isStarting && activeSession && (
        <>
          <WebShareQrCard session={activeSession} copied={copied} onCopy={copyUrl} />
          <WebShareInfoBanner session={activeSession} remainingFormatted={remainingFormatted} />
        </>
      )}

      {!isStarting && !activeSession && !error && (
        <div className="py-8 text-center text-xs text-current/60">
          No active share session. Right-click a file to share over LAN.
        </div>
      )}

      <WebShareControls
        onStop={handleStop}
        onClose={onClose}
        isSharing={Boolean(activeSession)}
      />
    </WebShareDialog>
  );
};
