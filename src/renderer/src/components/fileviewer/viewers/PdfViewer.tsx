import { useState } from 'react';
import { ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '../../ui/Button';
import { morphFileUrl, type ViewerProps } from '../types';

export function PdfViewer({ filePath, node, onOpenWithSystem }: ViewerProps): React.JSX.Element {
  const src = morphFileUrl(filePath);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="flex h-full flex-col bg-shell-surface">
      {/* Controls Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-shell-border bg-shell-sidebar/60 px-4 text-xs">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={14} />
          </Button>
          <span className="w-12 text-center font-mono">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={14} />
          </Button>
          <div className="h-4 w-px bg-shell-border mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRotate} title="Rotate">
            <RotateCw size={14} />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={onOpenWithSystem} className="gap-1.5 h-7 text-xs">
          <ExternalLink size={12} />
          <span>Open with System App</span>
        </Button>
      </div>

      {/* PDF View Container */}
      <div className="relative flex-1 overflow-auto bg-black/5 dark:bg-black/40 flex items-center justify-center p-4">
        <div
          className="h-full w-full max-w-5xl transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <embed
            src={src}
            type="application/pdf"
            className="h-full w-full rounded border border-shell-border shadow-sm bg-white"
            title={node.name}
          />
        </div>
      </div>
    </div>
  );
}
