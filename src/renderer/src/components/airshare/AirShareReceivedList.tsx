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
    <div className="flex flex-col h-full gap-4 p-5 bg-shell-surface border border-shell-border rounded-2xl shadow-sm min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-current">
          <HardDriveDownload className="w-4 h-4 text-sky-500" />
          <span>Received Inbound Files ({receivedFiles.length})</span>
        </div>
        <Button onClick={onOpenFolder} variant="outline" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer transition-all hover:border-sky-500/40">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open Folder</span>
        </Button>
      </div>

      {receivedFiles.length === 0 ? (
        <div className="flex flex-col flex-1 items-center justify-center py-8 px-4 gap-3 text-current/50 text-xs text-center bg-shell-sidebar rounded-xl border border-shell-border min-h-[220px]">
          <div className="p-3.5 rounded-full bg-shell-surface/60 border border-shell-border text-current/40">
            <Download className="w-7 h-7" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="font-semibold text-current/80 text-xs">No files received yet</p>
            <p className="text-current/50 text-[11px] leading-normal">Visitors on your local Wi-Fi network can upload files directly to your desktop drop zone.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
          {receivedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-shell-sidebar rounded-xl border border-shell-border text-xs hover:border-shell-border/80 transition-all"
            >
              <div className="flex flex-col min-w-0 flex-1 pr-2">
                <span className="font-semibold text-current truncate">{file.fileName}</span>
                <span className="text-[11px] text-current/60 mt-0.5">
                  {(file.fileSize / (1024 * 1024)).toFixed(2)} MB &bull; From {file.senderIp} &bull;{' '}
                  {new Date(file.receivedAt).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/20 uppercase shrink-0">
                Saved
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
