import React from 'react';
import { Wifi, Square, Radio } from 'lucide-react';
import { Button } from '@lablnet/ui';

interface AirShareHeaderProps {
  isServerActive: boolean;
  onStop: () => void;
}

export const AirShareHeader: React.FC<AirShareHeaderProps> = ({ isServerActive, onStop }) => {
  return (
    <div className="flex items-center justify-between p-5 bg-shell-surface border border-shell-border rounded-2xl shadow-sm shrink-0">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
          <Wifi className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-current">Morph AirShare</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                isServerActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-shell-sidebar text-current/60 border border-shell-border'
              }`}
            >
              <Radio className="w-3 h-3 animate-ping" />
              {isServerActive ? 'Server Online' : 'Standby'}
            </span>
          </div>
          <p className="text-xs text-current/60 mt-0.5">
            Local peer-to-peer file sharing & instant mobile drop zone
          </p>
        </div>
      </div>

      {isServerActive && (
        <Button onClick={onStop} variant="destructive" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer transition-all hover:scale-105">
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Server</span>
        </Button>
      )}
    </div>
  );
};
