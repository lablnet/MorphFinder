import { Minus, Plus, RotateCw, Maximize2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { ViewerProps } from '../types';
import { useImageViewer } from '@renderer/hooks';

export function ImageViewer({ filePath, node }: ViewerProps): React.JSX.Element {
  const {
    zoom,
    rotation,
    dimensions,
    isPanning,
    pan,
    containerRef,
    src,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleLoad,
    zoomIn,
    zoomOut,
    rotate,
    fitToView,
  } = useImageViewer({ filePath });

  return (
    <div className="flex h-full flex-col">
      {/* Image container */}
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={node.name}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            ...(zoom > 1 ? { maxHeight: 'none', maxWidth: 'none' } : {}),
          }}
          draggable={false}
          onLoad={handleLoad}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-shell-border bg-shell-surface px-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom out">
            <Minus size={14} />
          </Button>
          <span className="w-12 text-center text-xs text-current/70">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom in">
            <Plus size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={rotate} title="Rotate">
            <RotateCw size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={fitToView} title="Fit to view">
            <Maximize2 size={14} />
          </Button>
        </div>
        <span className="text-xs text-current/50">
          {dimensions !== null ? `${dimensions.w} × ${dimensions.h}` : ''}
        </span>
      </div>
    </div>
  );
}
