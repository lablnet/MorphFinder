import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AnnotationPreviewProps {
  notes: string;
}

export function AnnotationPreview({ notes }: AnnotationPreviewProps): React.JSX.Element {
  if (notes.trim().length === 0) {
    return <div className="rounded-shell border border-dashed border-shell-border p-3 text-xs text-current/45">Markdown preview is empty</div>;
  }

  return (
    <div className="markdown-viewer max-h-52 overflow-auto rounded-shell border border-shell-border bg-shell-sidebar/45 p-3 text-sm custom-scrollbar">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
    </div>
  );
}
