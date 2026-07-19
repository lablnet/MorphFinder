import React from 'react';
import { Copy, Check, QrCode, ShieldCheck, Download, Clock } from 'lucide-react';
import type { WebShareSession } from '@shared/types/webShare';

interface AirShareQrPanelProps {
  session: WebShareSession | null;
  copied: boolean;
  onCopy: () => void;
}

export const AirShareQrPanel: React.FC<AirShareQrPanelProps> = ({ session, copied, onCopy }) => {
  if (!session) return null;

  const remainingMins = Math.max(0, Math.floor((session.expiresAt - Date.now()) / (1000 * 60)));

  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-shell-surface border border-shell-border rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
        <QrCode className="w-4 h-4" />
        <span>Scan QR Code to Open Web Portal</span>
      </div>

      <div
        className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center border border-neutral-200 dark:border-neutral-700"
        dangerouslySetInnerHTML={{ __html: session.qrSvg }}
      />

      <div className="w-full flex items-center gap-2 bg-shell-sidebar px-3 py-2 rounded-xl border border-shell-border">
        <span className="text-xs font-mono text-current/80 truncate flex-1 select-all">
          {session.shareUrl}
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-shell-sidebar/50 border border-shell-border text-center">
          <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1" />
          <span className="text-[10px] uppercase text-current/50 font-semibold">Scope</span>
          <span className="text-xs text-current font-medium">LAN Subnet</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-shell-sidebar/50 border border-shell-border text-center">
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[10px] uppercase text-current/50 font-semibold">Downloads</span>
          <span className="text-xs text-current font-medium">{session.downloadCount}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-shell-sidebar/50 border border-shell-border text-center">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
          <span className="text-[10px] uppercase text-current/50 font-semibold">Expires</span>
          <span className="text-xs font-mono text-amber-600 dark:text-amber-300 font-medium">{remainingMins} mins</span>
        </div>
      </div>
    </div>
  );
};
