import { Loader2 } from 'lucide-react';
import type { ViewerProps } from '../types';
import { useTextViewer } from '@renderer/hooks';

export function TextViewer({ filePath }: ViewerProps): React.JSX.Element {
  const { content, error, truncated } = useTextViewer({ filePath });

  if (error !== null) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-current/60">
        <p>{error}</p>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-current/40" />
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div className="flex h-full flex-col">
      {truncated ? (
        <div className="shrink-0 border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs text-yellow-700 dark:text-yellow-400">
          File is too large to display completely. Showing the first 5 MB.
        </div>
      ) : null}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-sm">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-shell-sidebar/50">
                <td className="select-none border-r border-shell-border px-3 py-0 text-right text-xs text-current/30" style={{ width: '1%', whiteSpace: 'nowrap' }}>
                  {index + 1}
                </td>
                <td className="px-4 py-0 whitespace-pre-wrap break-all">
                  {line || '\u00A0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
