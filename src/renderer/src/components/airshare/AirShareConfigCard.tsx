import React from 'react';
import { Folder, Upload, FolderSearch } from 'lucide-react';
import { Button } from '@lablnet/ui';
import type { WebShareSession } from '@shared/types/webShare';

interface AirShareConfigCardProps {
  session: WebShareSession | null;
  allowInbound: boolean;
  onSelectFolder: () => void;
  onToggleInbound: (allowInbound: boolean) => void;
}

export const AirShareConfigCard: React.FC<AirShareConfigCardProps> = ({
  session,
  allowInbound,
  onSelectFolder,
  onToggleInbound,
}) => {
  return (
    <div className="flex flex-col gap-4 p-5 bg-shell-surface border border-shell-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-current">
          <Folder className="w-4 h-4 text-emerald-500" />
          <span>Shared Local Path</span>
        </div>
        <Button onClick={onSelectFolder} variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
          <FolderSearch className="w-3.5 h-3.5" />
          <span>Choose Folder</span>
        </Button>
      </div>

      <div className="p-3 bg-shell-sidebar rounded-xl border border-shell-border">
        <span className="text-xs font-mono text-current/80 truncate block">
          {session?.targetPath || 'No folder selected. Click Choose Folder to start sharing.'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-shell-border">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-sky-500" />
          <div>
            <div className="text-xs font-semibold text-current">Allow Inbound File Receiving</div>
            <div className="text-[11px] text-current/60">Phone/PC visitors can send files to desktop</div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allowInbound}
            onChange={(e) => onToggleInbound(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-shell-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>
    </div>
  );
};
