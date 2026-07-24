import React from 'react';
import { Square, X } from 'lucide-react';

interface WebShareControlsProps {
  onStop: () => void;
  onClose: () => void;
  isSharing: boolean;
}

export const WebShareControls: React.FC<WebShareControlsProps> = ({
  onStop,
  onClose,
  isSharing,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-3 border-t border-shell-border">
      {isSharing && (
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Sharing</span>
        </button>
      )}

      <button
        onClick={onClose}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-shell-sidebar text-current hover:bg-shell-border text-xs font-semibold transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Close</span>
      </button>
    </div>
  );
};
