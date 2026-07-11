import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ViewerProps } from '../types';
import { useMarkdownViewer } from '@renderer/hooks';

export function MarkdownViewer({ filePath }: ViewerProps): React.JSX.Element {
  const { content, error } = useMarkdownViewer({ filePath });

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

  return (
    <div className="h-full overflow-auto">
      <div className="markdown-viewer mx-auto max-w-3xl px-8 py-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
