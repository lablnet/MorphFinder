import React, { useState } from 'react';
import { useAirShareHub } from '../../hooks/webshare/useAirShareHub';
import { useInboundFiles } from '../../hooks/webshare/useInboundFiles';
import { FolderPickerDialog } from '../folderpicker/FolderPickerDialog';
import { AirShareHeader } from './AirShareHeader';
import { AirShareConfigCard } from './AirShareConfigCard';
import { AirShareQrPanel } from './AirShareQrPanel';
import { AirShareReceivedList } from './AirShareReceivedList';

export const AirShareHub: React.FC = () => {
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const {
    activeSession,
    allowInbound,
    copied,
    setFolder,
    toggleInbound,
    stopShare,
    copyUrl,
  } = useAirShareHub();

  const { receivedFiles, openReceivedFolder } = useInboundFiles();

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6 overflow-hidden bg-shell-surface box-border">
      <AirShareHeader isServerActive={Boolean(activeSession)} onStop={stopShare} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 w-full">
        {/* Left Column: Configuration & QR / Standby Info */}
        <div className="flex flex-col gap-6 overflow-y-auto min-h-0 pr-1">
          <AirShareConfigCard
            session={activeSession}
            allowInbound={allowInbound}
            onSelectFolder={() => setIsFolderPickerOpen(true)}
            onToggleInbound={(allow) => void toggleInbound(allow)}
          />
          <AirShareQrPanel session={activeSession} copied={copied} onCopy={copyUrl} />
        </div>

        {/* Right Column: Inbound Received Files */}
        <div className="flex flex-col h-full min-h-0">
          <AirShareReceivedList
            receivedFiles={receivedFiles}
            onOpenFolder={() => void openReceivedFolder()}
          />
        </div>
      </div>

      {isFolderPickerOpen && (
        <FolderPickerDialog
          title="Choose Folder to Share over LAN"
          initialPath={activeSession?.targetPath ?? null}
          onChoose={(chosenPath) => {
            setIsFolderPickerOpen(false);
            void setFolder(chosenPath);
          }}
          onClose={() => setIsFolderPickerOpen(false)}
        />
      )}
    </div>
  );
};
