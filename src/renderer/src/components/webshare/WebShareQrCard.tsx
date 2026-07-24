import React from 'react';
import DOMPurify from 'dompurify';
import { Copy, Check, QrCode } from 'lucide-react';
import type { WebShareSession } from '@shared/types/webShare';

interface WebShareQrCardProps {
  session: WebShareSession | null;
  copied: boolean;
  onCopy: () => void;
}

export const WebShareQrCard: React.FC<WebShareQrCardProps> = ({ session, copied, onCopy }) => {
  if (!session) return null;

  return (
    <div className="flex flex-col items-center gap-4 bg-shell-sidebar/60 dark:bg-neutral-950/70 p-5 rounded-xl border border-shell-border">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
        <QrCode className="w-4 h-4" />
        <span>Scan QR Code to Download</span>
      </div>

      <div
        className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center border border-neutral-200 dark:border-neutral-700"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(session.qrSvg, { USE_PROFILES: { svg: true } }) }}
      />

      <div className="w-full flex flex-col gap-1.5 text-center">
        <span className="text-sm font-semibold text-current truncate max-w-full">
          {session.fileName}
        </span>
        <span className="text-xs text-current/60">
          {session.isDirectory
            ? 'Directory Share'
            : `${(session.fileSize / (1024 * 1024)).toFixed(2)} MB`}
        </span>
      </div>

      <div className="w-full flex items-center gap-2 bg-shell-surface px-3 py-2 rounded-lg border border-shell-border">
        <span className="text-xs font-mono text-current/80 truncate flex-1 select-all">
          {session.shareUrl}
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
