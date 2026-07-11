import { FileQuestion, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import type { ViewerProps } from '../types';

export function UnknownViewer({ node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      {/* Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-current/5">
        <FileQuestion size={48} className="text-current/30" />
      </div>

      {/* File info */}
      <div className="text-center">
        <h2 className="mb-1 text-lg font-semibold">{node.name}</h2>
        <p className="text-sm text-current/50">
          {node.extension.length > 0 ? `.${node.extension} file` : 'Unknown file type'}
        </p>
      </div>

      {/* Metadata */}
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
        This file type cannot be previewed in MorphFinder. Use your system&apos;s default application to open it.
      </p>
    </div>
  );
}
