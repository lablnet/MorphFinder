import type { ViewerProps } from '../types';
import { morphFileUrl } from '../types';

export function PdfViewer({ filePath, node }: ViewerProps): React.JSX.Element {
  const src = morphFileUrl(filePath);

  return (
    <div className="flex h-full flex-col">
      <embed
        src={src}
        type="application/pdf"
        className="h-full w-full flex-1"
        title={node.name}
      />
    </div>
  );
}
