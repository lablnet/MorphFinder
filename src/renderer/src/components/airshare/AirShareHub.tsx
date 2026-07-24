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
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto w-full overflow-y-auto max-h-full">
      <AirShareHeader isServerActive={Boolean(activeSession)} onStop={stopShare} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-5">
          <AirShareConfigCard
            session={activeSession}
            allowInbound={allowInbound}
            onSelectFolder={() => setIsFolderPickerOpen(true)}
            onToggleInbound={(allow) => void toggleInbound(allow)}
          />
          <AirShareReceivedList
            receivedFiles={receivedFiles}
            onOpenFolder={() => void openReceivedFolder()}
          />
        </div>

        <div>
          <AirShareQrPanel session={activeSession} copied={copied} onCopy={copyUrl} />
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
