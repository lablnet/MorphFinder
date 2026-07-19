import React from 'react';
import { ShieldCheck, Download, Clock } from 'lucide-react';
import type { WebShareSession } from '@shared/types/webShare';

interface WebShareInfoBannerProps {
  session: WebShareSession | null;
  remainingFormatted: string;
}

export const WebShareInfoBanner: React.FC<WebShareInfoBannerProps> = ({
  session,
  remainingFormatted,
}) => {
  if (!session) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-shell-sidebar/50 border border-shell-border text-center">
        <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1" />
        <span className="text-[10px] uppercase text-current/50 font-semibold">Scope</span>
        <span className="text-xs text-current font-medium">LAN Only</span>
      </div>

      <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-shell-sidebar/50 border border-shell-border text-center">
        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
        <span className="text-[10px] uppercase text-current/50 font-semibold">Downloads</span>
        <span className="text-xs text-current font-medium">{session.downloadCount}</span>
      </div>

      <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-shell-sidebar/50 border border-shell-border text-center">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
        <span className="text-[10px] uppercase text-current/50 font-semibold">Expires In</span>
        <span className="text-xs font-mono text-amber-600 dark:text-amber-300 font-medium">{remainingFormatted}</span>
      </div>
    </div>
  );
};
