import { FileSpreadsheet, FileText, Presentation, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { ViewerProps } from '../types';

const OFFICE_ICONS: Record<string, typeof FileText> = {
  doc: FileText, docx: FileText, odt: FileText, pages: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, ods: FileSpreadsheet, numbers: FileSpreadsheet, csv: FileSpreadsheet,
  ppt: Presentation, pptx: Presentation, odp: Presentation, key: Presentation,
};

export function OfficeViewer({ node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  const Icon = OFFICE_ICONS[node.extension] ?? FileText;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      {/* Large icon */}
      <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--shell-accent)]/20 to-[color:var(--shell-accent)]/5 shadow-lg">
        <Icon size={56} className="text-[color:var(--shell-accent)]" />
      </div>

      {/* File info */}
      <div className="text-center">
        <h2 className="mb-1 text-lg font-semibold">{node.name}</h2>
        <p className="text-sm text-current/50">
          {node.extension.toUpperCase()} Document
        </p>
      </div>

      {/* Metadata table */}
      <div className="w-full max-w-sm rounded-shell border border-shell-border bg-shell-sidebar/50 p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-current/50">Size</dt>
            <dd className="font-medium">{formatBytes(node.sizeInBytes)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-current/50">Modified</dt>
            <dd className="font-medium">{formatModifiedDate(node.modifiedAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-current/50">Created</dt>
            <dd className="font-medium">{formatModifiedDate(node.createdAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-current/50">Type</dt>
            <dd className="font-medium">.{node.extension}</dd>
          </div>
        </dl>
      </div>

      {/* CTA */}
      <Button
        variant="accent"
        onClick={onOpenWithSystem}
        className="gap-2 px-6 py-2"
      >
        <ExternalLink size={16} />
        Open with System App
      </Button>

      <p className="max-w-sm text-center text-xs text-current/40">
        Office documents are best viewed in their native applications. Click above to open this file with your default app.
      </p>
    </div>
  );
}
