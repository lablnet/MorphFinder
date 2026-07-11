import { useCallback, useRef, useState } from 'react';
import { morphFileUrl } from '../../../components/fileviewer/types';

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

interface UseImageViewerOptions {
  filePath: string;
}

export function useImageViewer({ filePath }: UseImageViewerOptions) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const src = morphFileUrl(filePath);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    setZoom((current) => {
      const next = current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
    });
  }, []);

  const fitToView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (zoom <= 1) return;
    event.preventDefault();
    setIsPanning(true);
    panStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
  }, [zoom, pan]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: event.clientX - panStart.current.x,
      y: event.clientY - panStart.current.y,
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);
  const rotate = useCallback(() => setRotation((r) => r + 90), []);

  return {
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
  };
}
