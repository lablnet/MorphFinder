import React from 'react';
import { Download, FolderOpen, HardDriveDownload } from 'lucide-react';
import { Button } from '@lablnet/ui';
import type { ReceivedFile } from '@shared/types/webShare';

interface AirShareReceivedListProps {
  receivedFiles: ReceivedFile[];
  onOpenFolder: () => void;
}

export const AirShareReceivedList: React.FC<AirShareReceivedListProps> = ({
  receivedFiles,
  onOpenFolder,
}) => {
  return (
    <div className="flex flex-col gap-4 p-5 bg-shell-surface border border-shell-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-current">
          <HardDriveDownload className="w-4 h-4 text-sky-500" />
          <span>Received Inbound Files ({receivedFiles.length})</span>
        </div>
        <Button onClick={onOpenFolder} variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open Received Folder</span>
        </Button>
      </div>

      {receivedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-current/50 text-xs text-center bg-shell-sidebar rounded-xl border border-shell-border">
          <Download className="w-6 h-6 text-current/30" />
          <span>No files received yet. Visitors can upload files from phone or browser.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {receivedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-shell-sidebar rounded-xl border border-shell-border text-xs"
            >
              <div className="flex flex-col min-w-0 flex-1 pr-2">
                <span className="font-semibold text-current truncate">{file.fileName}</span>
                <span className="text-[11px] text-current/60">
                  {(file.fileSize / (1024 * 1024)).toFixed(2)} MB &bull; From {file.senderIp} &bull;{' '}
                  {new Date(file.receivedAt).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 uppercase">
                Saved
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
